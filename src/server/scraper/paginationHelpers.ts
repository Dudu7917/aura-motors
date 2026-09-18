/**
 * Utilitários de paginação e contagem de resultados para raspadores web.
 */

export function findTotalResultsRecursive(obj: any, context: { total: number } = { total: 0 }): number {
  if (!obj || typeof obj !== 'object') return context.total;
  
  const paginationKeys = ["TotalResults", "totalResults", "numFound", "Count", "count", "num_found"];
  
  for (const key of Object.keys(obj)) {
    if (paginationKeys.includes(key) && typeof obj[key] === 'number') {
      if (obj[key] > context.total && obj[key] < 10000) {
        context.total = obj[key];
      }
    }
    try {
      findTotalResultsRecursive(obj[key], context);
    } catch {}
  }
  
  return context.total;
}

export function getCurrentPageFromUrl(urlStr: string): number {
  try {
    const url = new URL(urlStr);
    const p = url.searchParams.get('page') || url.searchParams.get('p') || url.searchParams.get('pagina');
    if (p) {
      const parsedPage = parseInt(p, 10);
      return isNaN(parsedPage) ? 1 : parsedPage;
    }
  } catch {
    const match = urlStr.match(/[?&](page|p|pagina)=(\d+)/);
    if (match) {
      return parseInt(match[2], 10);
    }
  }
  return 1;
}

export function generateNextPagesUrls(urlStr: string, totalResults: number, itemsPerPage: number, currentPageNum: number): string[] {
  const nextUrls: string[] = [];
  if (totalResults <= itemsPerPage) return nextUrls;
  
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const maxPagesToScrape = Math.min(totalPages, 6); 
  
  for (let p = currentPageNum + 1; p <= maxPagesToScrape; p++) {
    try {
      const url = new URL(urlStr);
      url.searchParams.delete('p');
      url.searchParams.delete('pagina');
      url.searchParams.set('page', String(p));
      url.searchParams.set('p', String(p));
      nextUrls.push(url.toString());
    } catch {
      const separator = urlStr.includes('?') ? '&' : '?';
      nextUrls.push(`${urlStr}${separator}page=${p}`);
    }
  }
  return nextUrls;
}
