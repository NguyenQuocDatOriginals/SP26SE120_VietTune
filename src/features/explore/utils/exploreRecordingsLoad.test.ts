import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/semanticSearchService', () => ({
  semanticSearchService: {
    searchSemantic: vi.fn(),
  },
}));

vi.mock('@/services/recordingService', () => ({
  recordingService: {
    getGuestRecordings: vi.fn(),
    getGuestRecordingsByFilter: vi.fn(),
    searchRecordings: vi.fn(),
  },
}));

vi.mock('@/services/researcherArchiveService', () => ({
  fetchVerifiedSubmissionsAsRecordings: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/services/researcherRecordingFilterSearch', () => ({
  fetchRecordingsSearchByFilter: vi.fn().mockResolvedValue([]),
}));

import { loadExploreRecordings } from '@/features/explore/utils/exploreRecordingsLoad';
import { recordingService } from '@/services/recordingService';
import { fetchVerifiedSubmissionsAsRecordings } from '@/services/researcherArchiveService';
import { semanticSearchService } from '@/services/semanticSearchService';
import type { Recording } from '@/types';

function semanticRows(count: number, elapsedMs = 120) {
  return {
    results: Array.from({ length: count }, (_, i) => ({
      recording: {
        id: `sem-${i}`,
        title: `Track ${i}`,
        uploadedDate: new Date(2024, 0, 1 + ((count - i) % 28)).toISOString(),
      } as Recording,
      similarityScore: 1 - i * 0.01,
    })),
    elapsedMs,
  };
}

function mkRecording(p: { id: string; title: string; uploadedDate: string }): Recording {
  return {
    ...p,
    description: '',
    ethnicity: { id: 'eth-1', name: 'Group', nameVietnamese: 'Nhóm' },
  } as Recording;
}

describe('loadExploreRecordings semantic mode', () => {
  beforeEach(() => {
    vi.mocked(semanticSearchService.searchSemantic).mockReset();
    vi.mocked(fetchVerifiedSubmissionsAsRecordings).mockReset();
    vi.mocked(fetchVerifiedSubmissionsAsRecordings).mockResolvedValue([]);
  });

  it('requests topK 50 and paginates by currentPage without re-sorting by date', async () => {
    vi.mocked(semanticSearchService.searchSemantic).mockResolvedValue(semanticRows(25));

    const p1 = await loadExploreRecordings({
      currentPage: 1,
      exploreMode: 'semantic',
      filters: {},
      sqActive: 'câu chuyện',
      isAuthenticated: true,
    });
    expect(semanticSearchService.searchSemantic).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'câu chuyện', topK: 50 }),
    );
    expect(p1.totalResults).toBe(25);
    expect(p1.recordings).toHaveLength(20);
    expect(p1.recordings[0]?.id).toBe('sem-0');
    expect(p1.recordings[19]?.id).toBe('sem-19');
    expect(p1.dataSource).toBe('searchApi');
    expect(p1.semanticElapsedMs).toBe(120);

    const p2 = await loadExploreRecordings({
      currentPage: 2,
      exploreMode: 'semantic',
      filters: {},
      sqActive: 'câu chuyện',
      isAuthenticated: true,
    });
    expect(p2.totalResults).toBe(25);
    expect(p2.recordings).toHaveLength(5);
    expect(p2.recordings[0]?.id).toBe('sem-20');
    expect(p2.recordings[4]?.id).toBe('sem-24');
  });

  it('when vector API fails, returns empty list with fetchWarning', async () => {
    vi.mocked(semanticSearchService.searchSemantic).mockRejectedValue(new Error('semantic down'));
    vi.mocked(fetchVerifiedSubmissionsAsRecordings).mockResolvedValue([
      mkRecording({
        id: 'newer',
        title: 'chỉ có alpha',
        uploadedDate: '2024-06-01T00:00:00.000Z',
      }),
      mkRecording({
        id: 'older',
        title: 'alpha beta nhiều từ khóa',
        uploadedDate: '2010-01-01T00:00:00.000Z',
      }),
    ]);

    const r = await loadExploreRecordings({
      currentPage: 1,
      exploreMode: 'semantic',
      filters: {},
      sqActive: 'alpha beta',
      isAuthenticated: true,
    });

    expect(r.dataSource).toBe('empty');
    expect(r.recordings).toHaveLength(0);
    expect(r.fetchWarning).toMatch(/ngữ nghĩa/i);
  });
});

describe('loadExploreRecordings guest mode', () => {
  beforeEach(() => {
    vi.mocked(recordingService.getGuestRecordingsByFilter).mockReset();
  });

  it('without client filters, uses server page and totals from RecordingGuestByFilter', async () => {
    vi.mocked(recordingService.getGuestRecordingsByFilter).mockResolvedValue({
      items: [mkRecording({ id: 'x1', title: 'A', uploadedDate: '2024-01-01T00:00:00.000Z' })],
      total: 240,
      totalPages: 12,
      page: 3,
      pageSize: 20,
    });

    const r = await loadExploreRecordings({
      currentPage: 3,
      exploreMode: 'keyword',
      filters: {},
      sqActive: '',
      isAuthenticated: false,
    });

    expect(recordingService.getGuestRecordingsByFilter).toHaveBeenCalledWith({}, 3, 20, expect.any(Object));
    expect(r.totalResults).toBe(240);
    expect(r.recordings).toHaveLength(1);
  });

  it('with client filters, uses server page and totals from RecordingGuestByFilter', async () => {
    const page1Pool = Array.from({ length: 20 }, (_, i) =>
      mkRecording({
        id: `g-${i}`,
        title: `track common ${i}`,
        uploadedDate: new Date(2025, 0, 31 - i).toISOString(),
      }),
    );
    const page2Pool = Array.from({ length: 5 }, (_, i) =>
      mkRecording({
        id: `g-${i + 20}`,
        title: `track common ${i + 20}`,
        uploadedDate: new Date(2025, 0, 11 - i).toISOString(),
      }),
    );

    vi.mocked(recordingService.getGuestRecordingsByFilter).mockResolvedValue({
      items: page1Pool,
      total: 25,
      totalPages: 2,
      page: 1,
      pageSize: 20,
    });

    const r1 = await loadExploreRecordings({
      currentPage: 1,
      exploreMode: 'keyword',
      filters: { query: 'common' },
      sqActive: '',
      isAuthenticated: false,
    });
    expect(recordingService.getGuestRecordingsByFilter).toHaveBeenCalledWith(
      { query: 'common' },
      1,
      20,
      expect.any(Object),
    );
    expect(r1.totalResults).toBe(25);
    expect(r1.recordings).toHaveLength(20);
    expect(r1.recordings[0]?.id).toBe('g-0');

    vi.mocked(recordingService.getGuestRecordingsByFilter).mockClear();
    vi.mocked(recordingService.getGuestRecordingsByFilter).mockResolvedValue({
      items: page2Pool,
      total: 25,
      totalPages: 2,
      page: 2,
      pageSize: 20,
    });

    const r2 = await loadExploreRecordings({
      currentPage: 2,
      exploreMode: 'keyword',
      filters: { query: 'common' },
      sqActive: '',
      isAuthenticated: false,
    });
    expect(recordingService.getGuestRecordingsByFilter).toHaveBeenCalledWith(
      { query: 'common' },
      2,
      20,
      expect.any(Object),
    );
    expect(r2.totalResults).toBe(25);
    expect(r2.recordings).toHaveLength(5);
    expect(r2.recordings.map((x) => x.id)).toEqual(['g-20', 'g-21', 'g-22', 'g-23', 'g-24']);
  });
});
