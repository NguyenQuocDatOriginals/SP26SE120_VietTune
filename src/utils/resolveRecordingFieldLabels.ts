/** Resolve recording reference UUIDs to human-readable labels for display. */

function normalizeId(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

export type ReferenceNameMaps = {
  ethnicById: Map<string, string>;
  instrumentById: Map<string, string>;
  ceremonyById: Map<string, string>;
  vocalStyleById: Map<string, string>;
  communeById: Map<string, string>;
  musicalScaleById: Map<string, string>;
};

export function buildReferenceNameMaps(input: {
  ethnicGroups?: Array<{ id: string; name: string }>;
  instruments?: Array<{ id: string; name: string }>;
  ceremonies?: Array<{ id: string; name: string }>;
  vocalStyles?: Array<{ id: string; name: string }>;
  communes?: Array<{ id: string; name: string }>;
  musicalScales?: Array<{ id: string; name: string }>;
}): ReferenceNameMaps {
  const toMap = (items: Array<{ id: string; name: string }> | undefined) =>
    new Map((items ?? []).map((item) => [normalizeId(item.id), item.name]));

  return {
    ethnicById: toMap(input.ethnicGroups),
    instrumentById: toMap(input.instruments),
    ceremonyById: toMap(input.ceremonies),
    vocalStyleById: toMap(input.vocalStyles),
    communeById: toMap(input.communes),
    musicalScaleById: toMap(input.musicalScales),
  };
}

export function resolveReferenceLabel(
  id: string | null | undefined,
  map: Map<string, string>,
): string | null {
  if (!id?.trim()) return null;
  return map.get(normalizeId(id)) ?? null;
}

export function resolveInstrumentLabels(
  ids: string[] | null | undefined,
  map: Map<string, string>,
): string[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => resolveReferenceLabel(id, map) ?? id)
    .filter(Boolean);
}
