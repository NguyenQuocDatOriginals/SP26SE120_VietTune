import type { CeremonyItem } from '@/services/referenceDataService';

/**
 * Ceremony `type` values (see backend seed) that count as nghi lễ / lễ tiết tín ngưỡng–đời người
 * for showing optional "Thông tin quản trị và bản quyền". Excludes Festival, Harvest, Daily.
 */
const CEREMONY_TYPES_FOR_ADMIN_COPYRIGHT = new Set(['ritual', 'wedding', 'funeral']);

/**
 * Whether the selected "Loại sự kiện" is a ritual / life-ceremony type that warrants the admin & copyright block.
 */
export function shouldShowUploadAdminCopyrightSection(
  eventType: string,
  customEventType: string,
  ceremonies: CeremonyItem[],
): boolean {
  const label = eventType === 'Khác' ? customEventType.trim() : eventType.trim();
  if (!label) return false;
  const row = ceremonies.find((c) => c.name === label);
  if (!row) return false;
  const t = row.type?.trim().toLowerCase();
  if (!t) return false;
  return CEREMONY_TYPES_FOR_ADMIN_COPYRIGHT.has(t);
}
