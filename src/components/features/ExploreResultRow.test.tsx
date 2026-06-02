import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExploreResultRow } from '@/components/features/ExploreResultRow';
import {
  RecordingQuality,
  RecordingType,
  UserRole,
  VerificationStatus,
  type Recording,
} from '@/types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function mkRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 'rec-1',
    title: 'Bản thu mẫu',
    description: '',
    ethnicity: { id: 'e1', name: 'Kinh', nameVietnamese: 'Kinh' },
    region: '' as Recording['region'],
    recordingType: RecordingType.VOCAL,
    duration: 60,
    audioUrl: '',
    instruments: [],
    performers: [],
    uploadedDate: '2024-01-01T00:00:00.000Z',
    uploader: {
      id: 'u1',
      username: 'u',
      email: 'u@x.com',
      fullName: 'User',
      role: UserRole.CONTRIBUTOR,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    tags: [],
    metadata: { recordingQuality: RecordingQuality.FIELD_RECORDING },
    verificationStatus: VerificationStatus.VERIFIED,
    viewCount: 0,
    likeCount: 0,
    downloadCount: 0,
    ...overrides,
  } as Recording;
}

describe('ExploreResultRow semantic score', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows similarity badge when _semanticScore is present', () => {
    render(
      <MemoryRouter>
        <ExploreResultRow
          recording={mkRecording({ _semanticScore: 0.82 })}
          returnTo="/explore"
          rowIndex={0}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('82% khớp')).toBeTruthy();
  });

  it('omits similarity badge when _semanticScore is absent', () => {
    render(
      <MemoryRouter>
        <ExploreResultRow recording={mkRecording()} returnTo="/explore" rowIndex={0} />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/% khớp/)).toBeNull();
  });
});
