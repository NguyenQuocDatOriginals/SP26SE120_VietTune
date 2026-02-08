/**
 * Per-recording local storage to avoid OOM: never load all media blobs at once.
 * - localRecordingIds: JSON array of IDs
 * - localRecording_meta:{id}: metadata only (no audioData/videoData)
 * - localRecording_full:{id}: full record including media
 */

import type { LocalRecording } from "@/types";
import { getItemAsync, setItem, removeItem } from "@/services/storageService";
import { migrateVideoDataToVideoData } from "@/utils/helpers";

const IDS_KEY = "localRecordingIds";
const META_PREFIX = "localRecording_meta:";
const FULL_PREFIX = "localRecording_full:";
const MIGRATED_KEY = "localRecordings_migrated";

let migrationPromise: Promise<void> | null = null;

function metaKey(id: string): string {
  return META_PREFIX + id;
}

function fullKey(id: string): string {
  return FULL_PREFIX + id;
}

/** Strip audioData/videoData for list views to avoid loading blobs. */
export function toMeta(rec: LocalRecording): LocalRecording {
  const rest = { ...rec };
  delete (rest as Record<string, unknown>).audioData;
  delete (rest as Record<string, unknown>).videoData;
  return rest as LocalRecording;
}

async function ensureMigration(): Promise<void> {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    const done = await getItemAsync(MIGRATED_KEY);
    if (done === "1") return;

    const raw = await getItemAsync("localRecordings");
    if (!raw || raw.length === 0) {
      await setItem(IDS_KEY, "[]");
      await setItem(MIGRATED_KEY, "1");
      return;
    }

    try {
      const arr = JSON.parse(raw) as LocalRecording[];
      const ids: string[] = [];
      for (const rec of arr) {
        const id = rec.id ?? crypto.randomUUID();
        const withId = { ...rec, id };
        const migrated = migrateVideoDataToVideoData([withId])[0];
        const meta = toMeta(migrated);
        await setItem(metaKey(id), JSON.stringify(meta));
        await setItem(fullKey(id), JSON.stringify(migrated));
        ids.push(id);
      }
      await setItem(IDS_KEY, JSON.stringify(ids));
      await removeItem("localRecordings");
    } catch (e) {
      console.warn("Recording migration skipped (parse or write failed):", e);
    }
    await setItem(MIGRATED_KEY, "1");
  })();
  return migrationPromise;
}

/** List of all local recording IDs. */
export async function getLocalRecordingIds(): Promise<string[]> {
  await ensureMigration();
  const raw = await getItemAsync(IDS_KEY);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

/** List of metadata only (no audio/video blobs) — safe for list UIs. */
export async function getLocalRecordingMetaList(): Promise<LocalRecording[]> {
  const ids = await getLocalRecordingIds();
  const list: LocalRecording[] = [];
  for (const id of ids) {
    const raw = await getItemAsync(metaKey(id));
    if (raw) {
      try {
        list.push(JSON.parse(raw) as LocalRecording);
      } catch {
        // skip corrupt entry
      }
    }
  }
  return list;
}

/** Full recording including audioData/videoData — use only when needed (playback, edit). */
export async function getLocalRecordingFull(
  id: string,
): Promise<LocalRecording | null> {
  await ensureMigration();
  const raw = await getItemAsync(fullKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalRecording;
  } catch {
    return null;
  }
}

/** Save one recording (add or update). Updates IDs, meta, and full. */
export async function setLocalRecording(
  recording: LocalRecording,
): Promise<void> {
  await ensureMigration();
  const id = recording.id ?? crypto.randomUUID();
  const withId = { ...recording, id };
  const migrated = migrateVideoDataToVideoData([withId])[0];
  const meta = toMeta(migrated);
  // Đảm bảo meta luôn có uploader (ContributionsPage lọc theo uploader.id)
  const metaRecord = meta as Record<string, unknown>;
  if (migrated.uploader != null && metaRecord.uploader == null) {
    metaRecord.uploader = migrated.uploader;
  }

  const idsRaw = await getItemAsync(IDS_KEY);
  let ids: string[] = idsRaw ? (JSON.parse(idsRaw) as string[]) : [];
  if (!Array.isArray(ids)) ids = [];
  if (!ids.includes(id)) ids = [id, ...ids];
  await setItem(IDS_KEY, JSON.stringify(ids));
  await setItem(metaKey(id), JSON.stringify(meta));
  await setItem(fullKey(id), JSON.stringify(migrated));
}

/** Remove one recording. */
export async function removeLocalRecording(id: string): Promise<void> {
  await ensureMigration();
  const idsRaw = await getItemAsync(IDS_KEY);
  let ids: string[] = idsRaw ? (JSON.parse(idsRaw) as string[]) : [];
  if (!Array.isArray(ids)) ids = [];
  ids = ids.filter((x) => x !== id);
  await setItem(IDS_KEY, JSON.stringify(ids));
  await removeItem(metaKey(id));
  await removeItem(fullKey(id));
}

/** Remove all local recordings (e.g. on profile clear). */
export async function clearAllLocalRecordings(): Promise<void> {
  await ensureMigration();
  const ids = await getLocalRecordingIds();
  for (const id of ids) {
    await removeItem(metaKey(id));
    await removeItem(fullKey(id));
  }
  await setItem(IDS_KEY, "[]");
}
