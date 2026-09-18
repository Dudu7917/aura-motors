/**
 * Utilitários de validação e fallback de imagens de veículos.
 */

export function isPlaceholderOrInvalidImage(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const clean = url.trim().toLowerCase();
  if (clean.length < 10) return true;
  if (!clean.startsWith('http') && !clean.startsWith('data:image')) return true;

  const invalidKeywords = [
    'nao-disponivel', 'nao_disponivel', 'naodisponivel',
    'indisponivel', 'sem-foto', 'sem_foto', 'semfoto',
    'no-image', 'noimage', 'no-photo', 'nopic',
    'placeholder', 'pixel', 'transparent', 'logo',
    'avatar', 'icon', 'banner', 'favicon', 'social',
    'whatsapp', 'loader', 'loading', 'gif', 'default-car',
    'sem_imagem', 'imagem-nao', 'imagem_nao', 'badge',
    'theme', 'assets/img/nao'
  ];

  return invalidKeywords.some(kw => clean.includes(kw));
}

export function getHighResCarFallbackImage(brand?: string, category?: string, name?: string): { image: string; gallery: string[] } {
  const b = (brand || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();

  let primary = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
  let extra1 = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
  let extra2 = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";

  if (n.includes('ka') || b.includes('ford')) {
    primary = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1551522435-a13afa10f103?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('audi') || n.includes('q3')) {
    primary = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('bmw') || n.includes('x3') || n.includes('320i')) {
    primary = "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('jeep') || n.includes('compass') || n.includes('renegade') || c === 'suv') {
    primary = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('honda') || n.includes('civic') || n.includes('fit') || n.includes('hr-v')) {
    primary = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('toyota') || n.includes('corolla') || n.includes('hilux') || n.includes('yaris')) {
    primary = "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('chevrolet') || b.includes('gm') || n.includes('onix') || n.includes('cruze') || n.includes('tracker') || n.includes('prisma')) {
    primary = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('fiat') || n.includes('argo') || n.includes('toro') || n.includes('mobi') || n.includes('cronos')) {
    primary = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('volkswagen') || b.includes('vw') || n.includes('polo') || n.includes('gol') || n.includes('t-cross') || n.includes('virtus')) {
    primary = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop";
  } else if (c === 'electric' || b.includes('byd') || b.includes('gwm')) {
    primary = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop";
  }

  return {
    image: primary,
    gallery: [primary, extra1, extra2]
  };
}

export async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

