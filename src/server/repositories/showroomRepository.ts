import * as fs from "fs";
import * as path from "path";
import { Car } from "../../types";
import { deduplicateCars } from "../../utils/carDeduplicator";
import { saveCarsToDatabase, getCarsFromDatabase, CachePayload } from "../utils/firebase";

export class ShowroomRepository {
  public async getAll(): Promise<Car[]> {
    try {
      const cache = await getCarsFromDatabase();
      return cache?.cars || [];
    } catch (err: any) {
      console.error("[ShowroomRepository] Erro ao recuperar carros:", err.message || err);
      return [];
    }
  }

  public async saveAll(cars: Car[]): Promise<void> {
    const deduplicated = deduplicateCars(cars);
    await saveCarsToDatabase(deduplicated);
  }
}

export const showroomRepository = new ShowroomRepository();
