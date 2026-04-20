import type { ChatCitation } from './researcherPortalTypes';

import { REGION_NAMES } from '@/config/constants';
import { Recording } from '@/types';


export function asObject(input: unknown): Record<string, unknown> | null {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : null;
}

export function readExtraString(r: Recording, keys: string[]): string {
  const row = asObject(r);
  if (!row) return '';
  for (const key of keys) {
    const raw = row[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return '';
}

export function getEthnicityLabel(r: Recording): string {
  return (
    r.ethnicity?.nameVietnamese ??
    r.ethnicity?.name ??
    readExtraString(r, ['ethnicityName', 'ethnicGroupName', 'ethnicName'])
  );
}

export function getRegionLabel(r: Recording): string {
  const named = readExtraString(r, ['regionName', 'regionLabel']);
  if (named) return named;
  const fromEnum = r.region ? REGION_NAMES[r.region as keyof typeof REGION_NAMES] : '';
  if (fromEnum) return fromEnum;
  return readExtraString(r, ['region', 'provinceName', 'recordingLocation']);
}

export function getInstrumentLabel(r: Recording): string {
  if ((r.instruments?.length ?? 0) > 0) {
    return r.instruments
      .map((i) => i.nameVietnamese ?? i.name)
      .filter(Boolean)
      .join(', ');
  }
  const row = asObject(r);
  if (!row) return '';
  const names = row.instrumentNames;
  if (Array.isArray(names)) {
    const list = names.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
    if (list.length > 0) return list.join(', ');
  }
  return '';
}

export function getCeremonyLabel(r: Recording, eventTypes: string[]): string {
  const byTags = r.tags?.find(
    (t) => t === eventTypes.find((e) => e === t) || eventTypes.some((e) => t.includes(e)),
  );
  if (byTags) return byTags;
  const byMetadata = r.metadata?.ritualContext ?? '';
  if (byMetadata) return byMetadata;
  return readExtraString(r, ['ceremonyName', 'eventTypeName', 'ritualName']);
}

export function getCommuneName(r: Recording): string {
  const maybeWithCommune = r as Recording & {
    communeName?: string;
    commune?: { name?: string };
    metadata?: Recording['metadata'] & { communeName?: string };
  };
  return (
    maybeWithCommune.communeName ||
    maybeWithCommune.commune?.name ||
    maybeWithCommune.metadata?.communeName ||
    ''
  );
}

/** Tokenize for semantic search (NFD, no diacritics). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/\s+/)
    .filter(Boolean);
}

export function scoreRecording(r: Recording, tokens: string[]): number {
  const title = (r.title || '') + ' ' + (r.titleVietnamese || '');
  const desc = r.description || '';
  const ethnicityName =
    typeof r.ethnicity === 'object' && r.ethnicity !== null
      ? (r.ethnicity.name || '') + ' ' + (r.ethnicity.nameVietnamese || '')
      : '';
  const tags = (r.tags || []).join(' ');
  const more = [
    getRegionLabel(r),
    getInstrumentLabel(r),
    getCeremonyLabel(r, []),
    getCommuneName(r),
  ].join(' ');
  const searchable = [title, desc, ethnicityName, tags, more]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  let score = 0;
  for (const t of tokens) {
    if (searchable.includes(t)) score += 1;
  }
  return score;
}

export function getTranscriptText(r?: Recording): string {
  if (!r) return '';
  const lines = [r.metadata?.transcription, r.metadata?.lyrics, r.metadata?.lyricsTranslation];
  return lines.filter(Boolean).join('\n').trim();
}

export function highlightTranscriptDiff(
  left: string,
  right: string,
): { leftHtml: string; rightHtml: string } {
  const leftWords = left.split(/\s+/).filter(Boolean);
  const rightWords = right.split(/\s+/).filter(Boolean);
  const rightSet = new Set(rightWords.map((w) => w.toLowerCase()));
  const leftSet = new Set(leftWords.map((w) => w.toLowerCase()));

  const toHtml = (words: string[], oppositeSet: Set<string>) =>
    words
      .map((w) => {
        const escaped = w.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
        const changed = !oppositeSet.has(w.toLowerCase());
        return changed
          ? `<mark class="bg-amber-200 text-amber-900 rounded px-1">${escaped}</mark>`
          : escaped;
      })
      .join(' ');

  return {
    leftHtml: toHtml(leftWords, rightSet),
    rightHtml: toHtml(rightWords, leftSet),
  };
}

export function buildExpertComparativeNotes(left?: Recording, right?: Recording): string[] {
  if (!left || !right) return [];
  const notes: string[] = [];
  const leftEth = left.ethnicity?.nameVietnamese ?? left.ethnicity?.name ?? 'không rõ';
  const rightEth = right.ethnicity?.nameVietnamese ?? right.ethnicity?.name ?? 'không rõ';
  if (leftEth !== rightEth) {
    notes.push(
      `Hai bản thu thuộc hai cộng đồng khác nhau (${leftEth} và ${rightEth}), cần lưu ý dị bản vùng miền khi trích dẫn học thuật.`,
    );
  }
  const leftInst = new Set((left.instruments ?? []).map((i) => i.nameVietnamese ?? i.name));
  const rightInst = new Set((right.instruments ?? []).map((i) => i.nameVietnamese ?? i.name));
  const sharedInst = Array.from(leftInst).filter((x) => rightInst.has(x));
  if (sharedInst.length > 0) {
    notes.push(
      `Cả hai bản thu cùng dùng nhạc cụ: ${sharedInst.join(', ')}, phù hợp để đối chiếu kỹ thuật diễn tấu.`,
    );
  } else {
    notes.push(
      'Bộ nhạc cụ giữa hai bản thu khác nhau rõ rệt, thuận lợi cho phân tích khác biệt âm sắc.',
    );
  }
  const leftVariation = left.metadata?.regionalVariation;
  const rightVariation = right.metadata?.regionalVariation;
  if (leftVariation || rightVariation) {
    notes.push(
      `Ghi chú dị bản: ${leftVariation || 'Bản 1 chưa có ghi chú'} | ${rightVariation || 'Bản 2 chưa có ghi chú'}`,
    );
  }
  return notes;
}

export function buildCitationCandidates(question: string, recordings: Recording[]): ChatCitation[] {
  const tokens = tokenize(question);
  if (tokens.length === 0) return [];
  return recordings
    .map((r) => ({ r, score: scoreRecording(r, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ r }) => {
      const ethnicity = getEthnicityLabel(r) || 'Không rõ dân tộc';
      const region = getRegionLabel(r) || 'Không rõ vùng';
      return {
        recordingId: r.id,
        label: `${r.title} — ${ethnicity} — ${region}`,
      };
    });
}
