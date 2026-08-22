/**
 * Utilitários para manipulação e conversão assíncrona de arquivos no cliente.
 */

export interface ReadFileResult {
  base64Data: string;
  fileName: string;
  fileType: string;
}

/**
 * Converte um arquivo do navegador (File) para Base64 Data URL.
 */
export async function readFileAsBase64(file: File): Promise<ReadFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string) || '';
      resolve({
        base64Data,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream'
      });
    };
    reader.onerror = () => {
      reject(new Error(`Falha ao ler o arquivo: ${file.name}`));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converte uma string de texto puro colada em Base64 Data URL.
 */
export function convertTextStringToBase64(text: string, fileName = 'texto_copiado.txt'): ReadFileResult {
  const utf8Bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < utf8Bytes.byteLength; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Data = `data:text/plain;base64,${window.btoa(binary)}`;
  return {
    base64Data,
    fileName,
    fileType: 'text/plain'
  };
}

/**
 * Dispara o download de um arquivo gerado no navegador.
 */
export function triggerFileDownload(url: string, fileName?: string): void {
  const a = document.createElement('a');
  a.href = url;
  if (fileName) a.download = fileName;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
