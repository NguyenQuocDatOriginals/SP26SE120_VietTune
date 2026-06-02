/**
 * Normalizes GET /api/Analytics/submissions payloads into monthly trend data
 * (`Record<YYYY-MM, count>`) for {@link MonthlyTrendChart}.
 *
 * Supports:
 * - Legacy flat maps `{ "2024-01": 3, ... }`
 * - Swagger `SubmissionAnalyticsDto` (uses `byMonth` when present; otherwise `{}` for client fallback)
 */
const MONTH_KEY_PATTERN = /^\d{4}-(0?[1-9]|1[0-2])$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeNumericRecord(source: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
    }
  }
  return out;
}

function isMonthlyTrendRecord(source: Record<string, number>): boolean {
  const keys = Object.keys(source);
  return keys.length > 0 && keys.every((k) => MONTH_KEY_PATTERN.test(k));
}

function looksLikeSubmissionAnalyticsDto(obj: Record<string, unknown>): boolean {
  return (
    'total' in obj ||
    'byStatus' in obj ||
    'avgReviewTime' in obj ||
    'topEthnicGroups' in obj ||
    'byMonth' in obj ||
    'by_month' in obj
  );
}

function extractByMonthField(obj: Record<string, unknown>): Record<string, number> | null {
  const raw = obj.byMonth ?? obj.by_month;
  if (!isPlainObject(raw)) return null;
  const cleaned = sanitizeNumericRecord(raw);
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

/**
 * @param raw - Unwrapped `data` from ServiceResponse or legacy body
 */
export function parseSubmissionsTrendPayload(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};

  const byMonth = extractByMonthField(raw);
  if (byMonth) {
    return byMonth;
  }

  if (looksLikeSubmissionAnalyticsDto(raw)) {
    return {};
  }

  const legacy = sanitizeNumericRecord(raw);
  if (Object.keys(legacy).length === 0) return {};

  if (isMonthlyTrendRecord(legacy)) {
    return legacy;
  }

  const allTopLevelNumeric =
    Object.keys(raw).length > 0 &&
    Object.entries(raw).every(([, v]) => typeof v === 'number' && Number.isFinite(v));

  if (allTopLevelNumeric) {
    return legacy;
  }

  return {};
}
