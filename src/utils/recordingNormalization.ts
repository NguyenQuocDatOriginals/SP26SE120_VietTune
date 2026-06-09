import {
  Recording,
  RecordingType,
  RecordingQuality,
  InstrumentCategory,
} from '@/types';
import type { SubmissionLookupMaps } from '@/services/submissionApiMapper';

function normalizeId(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function pickRawString(raw: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const val = raw[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return '';
}

function resolvePerformerName(raw: Record<string, unknown>): string {
  const fromField = pickRawString(raw, ['performerName', 'PerformerName', 'artistName', 'artist']);
  if (fromField) return fromField;

  const basicInfo = raw.basicInfo;
  if (basicInfo && typeof basicInfo === 'object' && !Array.isArray(basicInfo)) {
    const artist = (basicInfo as Record<string, unknown>).artist;
    if (typeof artist === 'string' && artist.trim()) return artist.trim();
  }

  const performers = raw.performers;
  if (Array.isArray(performers) && performers.length > 0) {
    const first = performers[0];
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const name =
        (first as Record<string, unknown>).nameVietnamese ??
        (first as Record<string, unknown>).name;
      if (typeof name === 'string' && name.trim()) return name.trim();
    }
  }

  return '';
}

/**
 * Normalizes and enriches a raw recording DTO from the API into a complete FE Recording structure.
 * This fixes missing or unmapped fields such as:
 * - duration (from durationSeconds)
 * - recordingType (from performanceContext)
 * - metadata.tuningSystem (resolved from musicalScaleId)
 * - metadata.modalStructure (resolved from vocalStyleId)
 * - metadata.ritualContext (resolved from ceremonyId)
 * - ethnicity (resolved from ethnicGroupId)
 * - instruments (resolved from instrumentIds)
 */
export function normalizeRecording(
  raw: any,
  lookups?: SubmissionLookupMaps,
): Recording {
  if (!raw) return raw;

  // Clone to avoid side effects
  const normalized = { ...raw };

  // 1. Basic ID and Title mapping
  const id = normalized.id || normalized.recordingId || '';
  const title = normalized.title || 'Không có tiêu đề';

  // 2. Map Duration
  const duration =
    typeof normalized.duration === 'number' && normalized.duration > 0
      ? normalized.duration
      : typeof normalized.durationSeconds === 'number'
        ? normalized.durationSeconds
        : 0;

  // 3. Map Performance Context to RecordingType
  let recordingType = normalized.recordingType;
  const perfCtx = normalized.performanceContext || '';
  if (!recordingType && perfCtx) {
    const pCtx = String(perfCtx).trim().toLowerCase();
    if (pCtx === 'instrumental' || pCtx === 'nhạc cụ') {
      recordingType = RecordingType.INSTRUMENTAL;
    } else if (
      pCtx === 'vocal_accompaniment' ||
      pCtx === 'acappella' ||
      pCtx === 'hát với nhạc đệm'
    ) {
      recordingType = RecordingType.VOCAL;
    } else {
      recordingType = RecordingType.OTHER;
    }
  }
  if (!recordingType) {
    recordingType = RecordingType.OTHER;
  }

  // 4. Map Dates
  const recordedDate = normalized.recordedDate || normalized.recordingDate || undefined;
  const uploadedDate =
    normalized.uploadedDate ||
    normalized.submittedAt ||
    normalized.createdAt ||
    new Date().toISOString();

  // 5. Map Ethnicity
  const ethnicityObj =
    normalized.ethnicity &&
    typeof normalized.ethnicity === 'object' &&
    !Array.isArray(normalized.ethnicity)
      ? (normalized.ethnicity as { id?: string; name?: string; nameVietnamese?: string })
      : null;

  const placeholderEthnicIds = new Set(['local', 'semantic-ethnicity', 'guest-ethnicity']);
  const ethnicIdFromObject =
    ethnicityObj?.id && !placeholderEthnicIds.has(ethnicityObj.id) ? ethnicityObj.id : undefined;
  const ethnicGroupId = normalized.ethnicGroupId || ethnicIdFromObject;

  const existingEthnicName =
    ethnicityObj?.nameVietnamese?.trim() ||
    ethnicityObj?.name?.trim() ||
    pickRawString(normalized as Record<string, unknown>, [
      'ethnicityName',
      'ethnicGroupName',
      'ethnicName',
    ]);

  let ethnicity = normalized.ethnicity;
  const shouldResolveFromLookup =
    Boolean(ethnicGroupId && lookups?.ethnicById && !existingEthnicName);

  if (shouldResolveFromLookup || !ethnicity || (ethnicity.id === 'local' && ethnicGroupId)) {
    const ethId = ethnicGroupId;
    const ethName =
      ethId && lookups?.ethnicById
        ? lookups.ethnicById[normalizeId(ethId)]
        : undefined;
    ethnicity = {
      id: ethId || 'local',
      name: ethName || existingEthnicName || 'Không xác định',
      nameVietnamese: ethName || existingEthnicName || 'Không xác định',
      recordingCount: 0,
    };
  }

  // 6. Map Metadata
  const metadata = normalized.metadata ? { ...normalized.metadata } : {};
  metadata.recordingQuality =
    metadata.recordingQuality ?? RecordingQuality.FIELD_RECORDING;
  metadata.lyrics = metadata.lyrics ?? normalized.lyricsOriginal ?? '';
  metadata.lyricsTranslation =
    metadata.lyricsTranslation ?? normalized.lyricsVietnamese ?? '';

  let tuningSystem = 'Không rõ';
  if (normalized.musicalScaleName) {
    tuningSystem = normalized.musicalScaleName;
  } else if (normalized.musicalScale && typeof normalized.musicalScale === 'object') {
    tuningSystem = normalized.musicalScale.name || 'Không rõ';
  } else if (normalized.musicalScaleId && lookups?.musicalScaleById) {
    tuningSystem = lookups.musicalScaleById[normalizeId(normalized.musicalScaleId)] || 'Không rõ';
  } else if (metadata.tuningSystem) {
    tuningSystem = metadata.tuningSystem;
  }
  metadata.tuningSystem = tuningSystem;

  let modalStructure = 'Không rõ';
  if (normalized.vocalStyleName) {
    modalStructure = normalized.vocalStyleName;
  } else if (normalized.vocalStyle && typeof normalized.vocalStyle === 'object') {
    modalStructure = normalized.vocalStyle.name || 'Không rõ';
  } else if (normalized.vocalStyleId && lookups?.vocalStyleById) {
    modalStructure = lookups.vocalStyleById[normalizeId(normalized.vocalStyleId)] || 'Không rõ';
  } else if (metadata.modalStructure) {
    modalStructure = metadata.modalStructure;
  }
  metadata.modalStructure = modalStructure;

  let ritualContext = 'Không rõ';
  if (normalized.ceremonyName) {
    ritualContext = normalized.ceremonyName;
  } else if (normalized.ceremony && typeof normalized.ceremony === 'object') {
    ritualContext = normalized.ceremony.name || 'Không rõ';
  } else if (normalized.ceremonyId && lookups?.ceremonyById) {
    ritualContext = lookups.ceremonyById[normalizeId(normalized.ceremonyId)] || 'Không rõ';
  } else if (metadata.ritualContext) {
    ritualContext = metadata.ritualContext;
  }
  metadata.ritualContext = ritualContext;

  if (!metadata.culturalSignificance) {
    metadata.culturalSignificance = 'Không rõ';
  }

  // 7. Map Instruments
  let instruments = normalized.instruments || [];
  if (
    instruments.length === 0 &&
    normalized.instrumentIds &&
    Array.isArray(normalized.instrumentIds) &&
    lookups?.instrumentById
  ) {
    instruments = normalized.instrumentIds.map((instId: string) => {
      const name = lookups.instrumentById![normalizeId(instId)] || instId;
      return {
        id: instId,
        name,
        nameVietnamese: name,
        category: InstrumentCategory.IDIOPHONE,
        images: [],
        recordingCount: 0,
      };
    });
  }

  // 8. Resolve geographic hierarchy from communeId
  const rawCommuneId = normalized.communeId || (normalized.recording && normalized.recording.communeId) || '';
  let communeName = normalized.communeName || '';
  let districtName = normalized.districtName || '';
  let provinceName = normalized.provinceName || '';
  let regionName = normalized.regionName || '';

  if (rawCommuneId) {
    const cId = normalizeId(rawCommuneId);
    if (lookups?.communeById) {
      communeName = lookups.communeById[cId] || '';
    }
    if (lookups?.districtIdByCommuneId && lookups?.districtById) {
      const dId = lookups.districtIdByCommuneId[cId];
      if (dId) {
        districtName = lookups.districtById[dId] || '';
        if (lookups?.provinceIdByDistrictId && lookups?.provinceById) {
          const pId = lookups.provinceIdByDistrictId[dId];
          if (pId) {
            provinceName = lookups.provinceById[pId] || '';
            if (lookups?.macroRegionByProvinceId) {
              regionName = lookups.macroRegionByProvinceId[pId] || '';
            }
          }
        }
      }
    }
  }

  const performerName = resolvePerformerName(normalized as Record<string, unknown>);

  return {
    ...normalized,
    id,
    title,
    duration,
    recordingType,
    recordedDate,
    uploadedDate,
    ethnicity,
    metadata,
    instruments,
    communeId: rawCommuneId || undefined,
    communeName: communeName || undefined,
    districtName: districtName || undefined,
    provinceName: provinceName || undefined,
    regionName: regionName || undefined,
    ...(performerName ? { performerName } : {}),
  };
}
