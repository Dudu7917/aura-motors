import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { Car } from "../../types";
import { deduplicateCars } from "../../utils/carDeduplicator";

const LOCAL_CACHE_PATH = path.join(process.cwd(), "showroom-cache.json");

let firestoreDb: admin.firestore.Firestore | null = null;
let isFirebaseInitialized = false;

// Tenta inicializar o Firebase Admin SDK
try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // A chave privada precisa tratar aspas e quebras de linha normais
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    firestoreDb = admin.firestore();
    isFirebaseInitialized = true;
    console.log("[Firebase Utility] Firebase Admin SDK inicializado com sucesso.");
  } else {
    console.log("[Firebase Utility] Credenciais ausentes no .env. Usando cache em arquivo local showroom-cache.json");
  }
} catch (error: any) {
  console.warn("[Firebase Utility] Falha ao inicializar o Firebase. Usando fallback de cache em arquivo local.", error.message || error);
}

export interface CachePayload {
  cars: Car[];
  timestamp: string;
  source: string;
}

/**
 * Salva a lista de carros no Firebase Firestore ou no cache local.
 */
export async function saveCarsToDatabase(rawCars: Car[]): Promise<void> {
  const cars = deduplicateCars(rawCars);
  const payload: CachePayload = {
    cars,
    timestamp: new Date().toISOString(),
    source: isFirebaseInitialized ? "firebase_firestore" : "local_file_cache"
  };

  if (isFirebaseInitialized && firestoreDb) {
    try {
      console.log(`[Firebase Utility] Salvando ${cars.length} carros no Firestore...`);
      const docRef = firestoreDb.collection("showroom").doc("latest");
      await docRef.set(payload);
      console.log("[Firebase Utility] Salvo no Firestore com sucesso.");
      return;
    } catch (err: any) {
      console.error("[Firebase Utility] Erro ao salvar no Firestore. Salvando localmente como fallback...", err.message || err);
    }
  }

  // Fallback para arquivo JSON local
  try {
    fs.writeFileSync(LOCAL_CACHE_PATH, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[Firebase Utility] Salvo localmente em ${LOCAL_CACHE_PATH} com sucesso.`);
  } catch (err: any) {
    console.error("[Firebase Utility] Erro fatal ao salvar cache local:", err.message || err);
  }
}

/**
 * Recupera os carros salvos no Firebase ou no arquivo local.
 */
export async function getCarsFromDatabase(): Promise<CachePayload | null> {
  if (isFirebaseInitialized && firestoreDb) {
    try {
      console.log("[Firebase Utility] Buscando carros no Firestore...");
      const docRef = firestoreDb.collection("showroom").doc("latest");
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data() as CachePayload;
        console.log(`[Firebase Utility] Retornando ${data.cars.length} carros recuperados do Firestore.`);
        return {
          ...data,
          source: "firebase_firestore"
        };
      }
      console.log("[Firebase Utility] Nenhum documento encontrado no Firestore.");
    } catch (err: any) {
      console.error("[Firebase Utility] Erro ao buscar no Firestore. Buscando localmente...", err.message || err);
    }
  }

  // Leitura do arquivo JSON local
  try {
    if (fs.existsSync(LOCAL_CACHE_PATH)) {
      const rawData = fs.readFileSync(LOCAL_CACHE_PATH, "utf-8");
      const data = JSON.parse(rawData) as CachePayload;
      console.log(`[Firebase Utility] Retornando ${data.cars.length} carros do cache local.`);
      return {
        ...data,
        source: "local_file_cache"
      };
    }
  } catch (err: any) {
    console.error("[Firebase Utility] Erro ao ler cache local:", err.message || err);
  }

  return null;
}
