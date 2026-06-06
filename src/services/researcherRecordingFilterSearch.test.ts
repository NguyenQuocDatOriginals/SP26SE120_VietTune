import { describe, expect, it } from 'vitest';

import {
  applyResearcherFilters,
  buildResearcherFacetOptions,
} from '@/services/researcherRecordingFilterSearch';
import { EMPTY_SEARCH_FILTERS } from '@/features/researcher/researcherPortalTypes';
import { RecordingQuality, RecordingType, VerificationStatus } from '@/types';
import { Region } from '@/types';
import { UserRole } from '@/types';
import type { Recording } from '@/types';

function makeRecording(overrides: Partial<Recording> & Pick<Recording, 'id' | 'title'>): Recording {
  return {
    ethnicity: {
      id: 'e-kinh',
      name: 'Kinh',
      nameVietnamese: 'Kinh (Việt)',
      region: Region.RED_RIVER_DELTA,
      recordingCount: 1,
    },
    region: Region.RED_RIVER_DELTA,
    recordingType: RecordingType.FOLK_SONG,
    duration: 120,
    audioUrl: 'https://example.com/a.mp3',
    instruments: [{ id: 'i1', name: 'Đàn tranh', nameVietnamese: 'Đàn tranh' }],
    performers: [],
    uploadedDate: '2026-01-01T00:00:00.000Z',
    uploader: {
      id: 'u1',
      username: 'user',
      email: 'u@example.com',
      fullName: 'User',
      role: UserRole.CONTRIBUTOR,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    tags: ['Lễ hội'],
    metadata: {
      recordingQuality: RecordingQuality.FIELD_RECORDING,
      ritualContext: 'Lễ hội',
    },
    verificationStatus: VerificationStatus.VERIFIED,
    viewCount: 0,
    likeCount: 0,
    downloadCount: 0,
    ...overrides,
  };
}

describe('buildResearcherFacetOptions', () => {
  it('derives facet labels from catalog recordings, not enum keys', () => {
    const catalog = [
      makeRecording({ id: 'r1', title: 'Bài 1' }),
      makeRecording({
        id: 'r2',
        title: 'Bài 2',
        ethnicity: {
          id: 'e-tay',
          name: 'Tay',
          nameVietnamese: 'Tày',
          region: Region.NORTHERN_MOUNTAINS,
          recordingCount: 1,
        },
        region: Region.NORTHERN_MOUNTAINS,
        instruments: [{ id: 'i2', name: 'Khèn', nameVietnamese: 'Khèn' }],
        tags: ['Đám cưới'],
        metadata: { recordingQuality: RecordingQuality.FIELD_RECORDING, ritualContext: 'Đám cưới' },
      }),
    ];

    const facets = buildResearcherFacetOptions(catalog);

    expect(facets.ethnicities).toEqual(['Kinh (Việt)', 'Tày']);
    expect(facets.instruments).toEqual(['Đàn tranh', 'Khèn']);
    expect(facets.ceremonies).toEqual(['Đám cưới', 'Lễ hội']);
    expect(facets.regions).toEqual(['Đồng bằng Bắc Bộ', 'Trung du và miền núi Bắc Bộ']);
    expect(facets.regions).not.toContain('RED_RIVER_DELTA');
  });
});

describe('applyResearcherFilters', () => {
  const catalog = [
    makeRecording({ id: 'r1', title: 'Đàn tranh đồng bằng' }),
    makeRecording({
      id: 'r2',
      title: 'Khèn miền núi',
      ethnicity: {
        id: 'e-tay',
        name: 'Tay',
        nameVietnamese: 'Tày',
        region: Region.NORTHERN_MOUNTAINS,
        recordingCount: 1,
      },
      region: Region.NORTHERN_MOUNTAINS,
      instruments: [{ id: 'i2', name: 'Khèn', nameVietnamese: 'Khèn' }],
      tags: ['Đám cưới'],
      metadata: { recordingQuality: RecordingQuality.FIELD_RECORDING, ritualContext: 'Đám cưới' },
    }),
  ];

  it('returns the full catalog when filters are empty', () => {
    expect(applyResearcherFilters(catalog, EMPTY_SEARCH_FILTERS)).toHaveLength(2);
  });

  it('filters by Vietnamese region label instead of enum key', () => {
    const filtered = applyResearcherFilters(catalog, {
      ...EMPTY_SEARCH_FILTERS,
      region: 'Đồng bằng Bắc Bộ',
    });

    expect(filtered.map((r) => r.id)).toEqual(['r1']);
  });

  it('returns no results when region filter uses old enum key', () => {
    const filtered = applyResearcherFilters(catalog, {
      ...EMPTY_SEARCH_FILTERS,
      region: 'RED_RIVER_DELTA',
    });

    expect(filtered).toEqual([]);
  });

  it('filters by ethnicity, instrument, and ceremony labels', () => {
    const filtered = applyResearcherFilters(catalog, {
      ...EMPTY_SEARCH_FILTERS,
      ethnicity: 'Tày',
      instrument: 'Khèn',
      ceremony: 'Đám cưới',
    });

    expect(filtered.map((r) => r.id)).toEqual(['r2']);
  });

  it('combines multiple filters with AND semantics', () => {
    const filtered = applyResearcherFilters(catalog, {
      ...EMPTY_SEARCH_FILTERS,
      ethnicity: 'Kinh (Việt)',
      instrument: 'Khèn',
    });

    expect(filtered).toEqual([]);
  });
});
