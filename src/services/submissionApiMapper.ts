import type { LocalRecording } from '@/types';
import { ModerationStatus, toApiSubmissionStatus, toModerationUiStatus, type ApiSubmissionStatus } from '@/types';
import { pickContributorFieldsFromApiRow } from '@/utils/contributorFields';

export interface SubmissionLookupMaps {
  ethnicById?: Record<string, string>;
  ceremonyById?: Record<string, string>;
  instrumentById?: Record<string, string>;
  communeById?: Record<string, string>;
  districtById?: Record<string, string>;
  provinceById?: Record<string, string>;
  vocalStyleById?: Record<string, string>;
  musicalScaleById?: Record<string, string>;
  /** Normalized province UUID → “vùng/miền” label from `province.regionCode` (not tên phường/xã). */
  macroRegionByProvinceId?: Record<string, string>;
  /** Normalized district UUID → normalized province UUID */
  provinceIdByDistrictId?: Record<string, string>;
  /** Normalized commune UUID → normalized district UUID */
  districtIdByCommuneId?: Record<string, string>;
}

function normalizeId(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function pickField(row: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!row) return undefined;
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k];
  }
  return undefined;
}

/** Địa lý cấp tỉnh → nhãn vùng/miền; không dùng tên phường/xã/huyện cho “Vùng miền”. */
function macroRegionLabelFromGeo(
  lookups: SubmissionLookupMaps | undefined,
  provinceId: string | undefined,
  districtId: string | undefined,
  communeId: string | undefined,
): string | undefined {
  if (!lookups?.macroRegionByProvinceId) return undefined;
  const byProv = lookups.macroRegionByProvinceId;
  let pid = provinceId ? normalizeId(provinceId) : '';
  if (!pid && districtId && lookups.provinceIdByDistrictId) {
    pid = lookups.provinceIdByDistrictId[normalizeId(districtId)] ?? '';
  }
  if (!pid && communeId && lookups.districtIdByCommuneId && lookups.provinceIdByDistrictId) {
    const did = lookups.districtIdByCommuneId[normalizeId(communeId)] ?? '';
    if (did) pid = lookups.provinceIdByDistrictId[did] ?? '';
  }
  if (!pid) return undefined;
  const label = byProv[pid];
  return label?.trim() || undefined;
}

export function mapApiSubmissionStatusToModeration(raw: unknown): ApiSubmissionStatus | undefined {
  return toApiSubmissionStatus(raw);
}

/** Normalize list payloads from various VietTune API envelope shapes. */
export function extractSubmissionRows(res: unknown): Record<string, unknown>[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as Record<string, unknown>[];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
  const data = r.data as Record<string, unknown> | undefined;
  if (data && Array.isArray(data.items)) return data.items as Record<string, unknown>[];
  if (Array.isArray(r.items)) return r.items as Record<string, unknown>[];
  // PascalCase (.NET JSON without camelCase resolver)
  if (Array.isArray(r.Data)) return r.Data as Record<string, unknown>[];
  const dataP = r.Data as Record<string, unknown> | undefined;
  if (dataP && Array.isArray(dataP.Items)) return dataP.Items as Record<string, unknown>[];
  if (dataP && Array.isArray(dataP.items)) return dataP.items as Record<string, unknown>[];
  if (Array.isArray(r.Items)) return r.Items as Record<string, unknown>[];
  return [];
}

/**
 * Map a submission object from GET /Submission/* or admin list to LocalRecording (meta).
 */
export function mapSubmissionToLocalRecording(
  x: Record<string, unknown>,
  lookups?: SubmissionLookupMaps,
): LocalRecording {
  const recRaw = pickField(x, 'recording', 'Recording');
  const rec =
    recRaw && typeof recRaw === 'object' ? (recRaw as Record<string, unknown>) : null;

  const submissionId = String(x.id ?? x.Id ?? '');
  const recordingEntityId =
    rec?.id != null && String(rec.id).trim()
      ? String(rec.id).trim()
      : rec?.Id != null && String(rec.Id).trim()
        ? String(rec.Id).trim()
        : '';
  const topLevelRecordingId = String(x.recordingId ?? x.RecordingId ?? '').trim();
  const recordingId = recordingEntityId || topLevelRecordingId || '';
  const id = submissionId || recordingId;
  const title =
    (pickField(rec, 'title', 'Title') as string | undefined) ||
    (pickField(x, 'title', 'Title') as string | undefined) ||
    'Không có tiêu đề';
  const audioFileUrl =
    (pickField(rec, 'audioFileUrl', 'AudioFileUrl') as string | undefined) ??
    (pickField(x, 'audioFileUrl', 'AudioFileUrl') as string | undefined) ??
    undefined;
  const videoFileUrl =
    (pickField(rec, 'videoFileUrl', 'VideoFileUrl') as string | undefined) ??
    (pickField(x, 'videoFileUrl', 'VideoFileUrl') as string | undefined) ??
    undefined;
  const statusRaw = pickField(x, 'status', 'Status');
  const apiStatus = mapApiSubmissionStatusToModeration(statusRaw);
  let moderationStatus = toModerationUiStatus(apiStatus);
  const reviewerId =
    (pickField(x, 'reviewerId', 'ReviewerId') as string | undefined) ??
    (pickField(x, 'assignedReviewerId', 'AssignedReviewerId') as string | undefined) ??
    (pickField(x, 'claimedBy', 'ClaimedBy') as string | undefined);

  if (
    moderationStatus === ModerationStatus.PENDING_REVIEW &&
    reviewerId &&
    String(reviewerId).trim()
  ) {
    moderationStatus = ModerationStatus.IN_REVIEW;
  }

  const claimedBy =
    moderationStatus === ModerationStatus.IN_REVIEW && reviewerId ? reviewerId : undefined;

  const instrumentRaw = pickField(rec, 'instrumentIds', 'InstrumentIds');
  const instrumentIds = Array.isArray(instrumentRaw) ? (instrumentRaw as unknown[]) : [];
  const instrumentObjects = Array.isArray(pickField(rec, 'instruments', 'Instruments'))
    ? (pickField(rec, 'instruments', 'Instruments') as Array<Record<string, unknown>>)
    : [];
  const mappedInstrumentNames = instrumentIds
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .map((idVal) => lookups?.instrumentById?.[normalizeId(idVal)] || `ID:${idVal}`);
  const embeddedInstrumentNames = instrumentObjects
    .map((it) => String(it?.name ?? it?.nameVietnamese ?? it?.Name ?? '').trim())
    .filter(Boolean);
  const instrumentNames =
    mappedInstrumentNames.length > 0 ? mappedInstrumentNames : embeddedInstrumentNames;

  const communeId =
    (pickField(rec, 'communeId', 'CommuneId') as string | undefined) ||
    (pickField(x, 'communeId', 'CommuneId') as string | undefined);
  const districtId =
    (pickField(rec, 'districtId', 'DistrictId') as string | undefined) ||
    (pickField(x, 'districtId', 'DistrictId') as string | undefined);
  const provinceId =
    (pickField(rec, 'provinceId', 'ProvinceId') as string | undefined) ||
    (pickField(x, 'provinceId', 'ProvinceId') as string | undefined);

  const ethnicGroupId = pickField(rec, 'ethnicGroupId', 'EthnicGroupId');
  const ceremonyId = pickField(rec, 'ceremonyId', 'CeremonyId');

  const ethnicityFromApi =
    (pickField(x, 'ethnicityName', 'EthnicityName') as string | undefined) ||
    (pickField(rec, 'ethnicityName', 'EthnicityName') as string | undefined) ||
    (pickField(rec, 'ethnicGroupName', 'EthnicGroupName') as string | undefined) ||
    ((pickField(rec, 'ethnicGroup', 'EthnicGroup') as Record<string, unknown> | undefined)?.name as
      | string
      | undefined) ||
    (ethnicGroupId
      ? lookups?.ethnicById?.[normalizeId(ethnicGroupId)] || `ID:${String(ethnicGroupId)}`
      : undefined);

  const eventTypeFromApi =
    (pickField(x, 'ceremonyName', 'CeremonyName') as string | undefined) ||
    (pickField(rec, 'ceremonyName', 'CeremonyName') as string | undefined) ||
    ((pickField(rec, 'ceremony', 'Ceremony') as Record<string, unknown> | undefined)?.name as
      | string
      | undefined) ||
    (ceremonyId
      ? lookups?.ceremonyById?.[normalizeId(ceremonyId)] || `ID:${String(ceremonyId)}`
      : undefined);

  const explicitRegion =
    (typeof rec?.region === 'string' && rec.region.trim() ? rec.region.trim() : undefined) ||
    (typeof x.region === 'string' && x.region.trim() ? x.region.trim() : undefined);
  const regionMacroLabel =
    macroRegionLabelFromGeo(lookups, provinceId, districtId, communeId) ||
    explicitRegion ||
    undefined;

  const contribSubmission = pickContributorFieldsFromApiRow(x);
  const contribRecording = pickContributorFieldsFromApiRow(rec ?? undefined);
  const uploaderId =
    contribRecording.id ||
    contribSubmission.id ||
    String(
      (rec?.uploadedById as string | undefined) ||
        (x.uploadedById as string | undefined) ||
        (x.contributorId as string | undefined) ||
        '',
    ).trim();
  const contributorFullName = contribRecording.fullName ?? contribSubmission.fullName;
  const contributorUsername = contribRecording.username ?? contribSubmission.username;

  const mapped: LocalRecording = {
    id,
    ...(recordingId ? { recordingId } : {}),
    ...(submissionId ? { submissionId } : {}),
    title,
    mediaType: audioFileUrl ? 'audio' : videoFileUrl ? 'video' : undefined,
    audioUrl: audioFileUrl,
    videoData: videoFileUrl,
    moderation: {
      status: moderationStatus as unknown as ApiSubmissionStatus,
      ...(claimedBy ? { claimedBy } : {}),
      /** Pass through when API sends it so expert queue filters (`reviewerId === userId`) match assigned items. */
      ...(reviewerId && String(reviewerId).trim()
        ? { reviewerId: String(reviewerId).trim() }
        : {}),
    },
    uploadedDate: (x.createdAt as string) || (x.submittedAt as string) || new Date().toISOString(),
    basicInfo: {
      title,
      artist:
        (pickField(rec, 'performerName', 'PerformerName') as string | undefined) ||
        (pickField(x, 'performerName', 'PerformerName') as string | undefined) ||
        (pickField(x, 'submittedBy', 'SubmittedBy') as string | undefined),
      composer: pickField(rec, 'composer', 'Composer') as string | undefined,
      language: pickField(rec, 'language', 'Language') as string | undefined,
      recordingLocation: pickField(rec, 'recordingLocation', 'RecordingLocation') as
        | string
        | undefined,
    },
    uploader: {
      id: uploaderId,
      ...(contributorFullName ? { fullName: contributorFullName } : {}),
      ...(contributorUsername ? { username: contributorUsername } : {}),
    },
    culturalContext: {
      ethnicity: ethnicityFromApi,
      region: regionMacroLabel,
      province:
        (communeId ? lookups?.communeById?.[normalizeId(communeId)] : undefined) ||
        (pickField(rec, 'communeName', 'CommuneName') as string | undefined) ||
        undefined,
      eventType: eventTypeFromApi,
      instruments: instrumentNames,
      performanceType:
        (pickField(rec, 'performanceContext', 'PerformanceContext') as string | undefined) ||
        undefined,
    },
    ...(typeof pickField(rec, 'durationSeconds', 'DurationSeconds') === 'number' &&
    Number.isFinite(pickField(rec, 'durationSeconds', 'DurationSeconds') as number)
      ? { duration: Math.floor(pickField(rec, 'durationSeconds', 'DurationSeconds') as number) }
      : {}),
    ...(pickField(rec, 'description', 'Description') &&
    String(pickField(rec, 'description', 'Description')).trim()
      ? { description: String(pickField(rec, 'description', 'Description')).trim() }
      : {}),
    ...(pickField(rec, 'recordingDate', 'RecordingDate') &&
    String(pickField(rec, 'recordingDate', 'RecordingDate')).trim()
      ? { recordedDate: String(pickField(rec, 'recordingDate', 'RecordingDate')).trim() }
      : {}),
    vocalStyleId: (pickField(rec, 'vocalStyleId', 'VocalStyleId') as string | undefined) || undefined,
    musicalScaleId: (pickField(rec, 'musicalScaleId', 'MusicalScaleId') as string | undefined) || undefined,
    ceremonyId: (pickField(rec, 'ceremonyId', 'CeremonyId') as string | undefined) || undefined,
    performanceContext: (pickField(rec, 'performanceContext', 'PerformanceContext') as string | undefined) || undefined,
    communeId: communeId || undefined,
    metadata: {
      lyrics: (pickField(rec, 'lyricsOriginal', 'LyricsOriginal') as string | undefined) || undefined,
      lyricsTranslation: (pickField(rec, 'lyricsVietnamese', 'LyricsVietnamese') as string | undefined) || undefined,
    },
  };
  return mapped;
}
