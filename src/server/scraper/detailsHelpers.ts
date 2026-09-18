/**
 * Helpers para extração nativa de fotos e dados estruturados de anúncios (Webmotors e similares).
 */

export function extractAllVehiclePhotos(rawContent: string): string[] {
  if (!rawContent) return [];

  // 1. Desescapar barras invertidas em strings JSON (ex: https:\/\/image.webmotors.com.br\/_fotos\/...)
  const unescaped = rawContent.replace(/\\\/|\\/g, '/');
  const extracted: string[] = [];

  // 2. Extrair caminhos relativos da Webmotors dentro de JSON
  const wmRelativeRegex = /"(?:Path|url|src|image|foto)":\s*"(_fotos\/[^\s"'<>)]+|card_solr\/[^\s"'<>)]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = wmRelativeRegex.exec(rawContent)) !== null) {
    const relPath = match[1].replace(/\\\/|\\/g, '/');
    extracted.push(`https://image.webmotors.com.br/${relPath}`);
  }

  // 3. Extração por Regex de URLs absolutas com extensões de imagem comuns
  const fullUrlRegex = /https?:\/\/[^\s"'<>)]+?\.(?:jpg|jpeg|png|webp|jfif)(?:\?[^\s"'<>)]*)?/gi;
  const matchedFullUrls = unescaped.match(fullUrlRegex) || [];
  extracted.push(...matchedFullUrls);

  // 4. Extração específica para subdomínios da CDN de imagens do Webmotors
  const wmCdnRegex = /https?:\/\/(?:image[s]?|s|wm-images|cdn|foto[s]?)\.webmotors\.com\.br\/[^\s"'<>)]+/gi;
  const matchedWmCdn = unescaped.match(wmCdnRegex) || [];
  extracted.push(...matchedWmCdn);

  // 5. Sanitização, limpeza de pontuação e deduplicação
  return Array.from(new Set(
    extracted
      .map(url => {
        let clean = url.trim().replace(/[),;.\\]+$/, '');
        clean = clean.replace(/["'\]\}]+$/, '');
        return clean;
      })
      .filter(url => {
        if (!url || !url.startsWith('http') || url.length < 20) return false;
        const lower = url.toLowerCase();
        return !lower.includes('pixel') &&
               !lower.includes('logo') &&
               !lower.includes('transparent') &&
               !lower.includes('avatar') &&
               !lower.includes('icon') &&
               !lower.includes('banner') &&
               !lower.includes('favicon') &&
               !lower.includes('badge') &&
               !lower.includes('social') &&
               !lower.includes('whatsapp') &&
               !lower.includes('placeholder');
      })
  ));
}

export function extractNativeWebmotorsDetails(rawNextDataText: string) {
  const result: {
    equipments?: string[];
    description?: string;
    sellerName?: string;
    fipePrice?: number;
    color?: string;
  } = {};

  if (!rawNextDataText) return result;

  try {
    // 1. Extração de Equipamentos / Opcionais
    const equipMatches = rawNextDataText.match(/"(?:Equipments|equipments|Opcionais|opcionais)":\s*(\[[^\]]+\])/i);
    if (equipMatches && equipMatches[1]) {
      try {
        const parsed = JSON.parse(equipMatches[1]);
        if (Array.isArray(parsed)) {
          const names = parsed
            .map((item: any) => (typeof item === 'string' ? item : item?.Name || item?.name || item?.value || item?.Value))
            .filter((n: any) => typeof n === 'string' && n.trim().length > 0);
          if (names.length > 0) result.equipments = Array.from(new Set(names));
        }
      } catch {}
    }

    // 2. Extração de Descrição Longa do Vendedor
    const descMatches = rawNextDataText.match(/"(?:LongDescription|longDescription|Description|description)":\s*"([^"]+)"/i);
    if (descMatches && descMatches[1]) {
      result.description = descMatches[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim();
    }

    // 3. Extração de Nome da Loja / Vendedor
    const sellerMatches = rawNextDataText.match(/"(?:SellerName|sellerName|FantasyName|fantasyName|TradingName)":\s*"([^"]+)"/i);
    if (sellerMatches && sellerMatches[1]) {
      result.sellerName = sellerMatches[1].trim();
    }

    // 4. Cotação Tabela Fipe
    const fipeMatches = rawNextDataText.match(/"Fipe":\s*\{[^}]*"(?:Price|price)":\s*(\d+)/i) ||
                        rawNextDataText.match(/"(?:FipePrice|fipePrice)":\s*(\d+)/i);
    if (fipeMatches && fipeMatches[1]) {
      result.fipePrice = parseInt(fipeMatches[1], 10);
    }

    // 5. Extração de Cor Nativa
    const colorMatches = rawNextDataText.match(/"(?:Color|Specification\.Color|Cor)":\s*(?:\{[^}]*"(?:Name|Value)":\s*"([^"]+)"|"([^"]+)")/i) ||
                         rawNextDataText.match(/"(?:ColorName|colorName|CorVeiculo|ExternalColor)":\s*"([^"]+)"/i);
    if (colorMatches) {
      result.color = (colorMatches[1] || colorMatches[2] || "").trim();
    }
  } catch (e) {
    console.error("[Native Webmotors Extraction Error]", e);
  }

  return result;
}
