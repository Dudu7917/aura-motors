import { Lead } from '../../types';

/**
 * Limpa e extrai apenas os dígitos numéricos de um número de telefone.
 */
export function sanitizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Verifica se dois leads são duplicados com base no telefone ou e-mail.
 */
export function isDuplicateLead(a: Partial<Lead>, b: Partial<Lead>): boolean {
  const phoneA = sanitizePhone(a.phone);
  const phoneB = sanitizePhone(b.phone);
  if (phoneA && phoneB && phoneA === phoneB) return true;

  if (a.email && b.email && a.email.trim().toLowerCase() === b.email.trim().toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Estratégia de mesclagem para resolução de conflito de leads.
 */
export function mergeLeadConflict(existing: Lead, incoming: Lead): Lead {
  return {
    ...existing,
    fullName: incoming.fullName || existing.fullName,
    phone: incoming.phone || existing.phone,
    email: incoming.email || existing.email,
    desiredBrand: incoming.desiredBrand || existing.desiredBrand,
    desiredModel: incoming.desiredModel || existing.desiredModel,
    minYear: incoming.minYear !== undefined ? incoming.minYear : existing.minYear,
    maxYear: incoming.maxYear !== undefined ? incoming.maxYear : existing.maxYear,
    maxPrice: incoming.maxPrice !== undefined ? incoming.maxPrice : existing.maxPrice,
    priority: incoming.priority || existing.priority,
    notes: incoming.notes
      ? (existing.notes ? `${existing.notes} | ${incoming.notes}` : incoming.notes)
      : existing.notes
  };
}

/**
 * Separa uma lista de leads importados entre não-duplicados e duplicados com relação à base existente.
 */
export function partitionIncomingLeads(
  existingLeads: Lead[],
  incomingLeads: Lead[]
): {
  nonDuplicates: Lead[];
  duplicates: { existing: Lead; incoming: Lead }[];
} {
  const duplicates: { existing: Lead; incoming: Lead }[] = [];
  const nonDuplicates: Lead[] = [];

  incomingLeads.forEach(incoming => {
    const existing = existingLeads.find(l => isDuplicateLead(l, incoming));
    if (existing) {
      duplicates.push({ existing, incoming });
    } else {
      nonDuplicates.push(incoming);
    }
  });

  return { nonDuplicates, duplicates };
}
