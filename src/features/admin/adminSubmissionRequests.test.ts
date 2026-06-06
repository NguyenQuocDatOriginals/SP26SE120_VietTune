import { describe, expect, it } from 'vitest';

import {
  deriveDeleteRecordingRequests,
  deriveEditRecordingRequests,
  parseAdminSubmissionRows,
} from '@/features/admin/adminSubmissionRequests';

describe('adminSubmissionRequests', () => {
  it('parses admin submission rows from mixed casing', () => {
    const rows = parseAdminSubmissionRows([
      { Id: 'sub-1', Title: 'Bài A', Status: 'UpdateRequested', SubmittedBy: 'user-1' },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe('sub-1');
    expect(rows[0]?.status).toBe('UpdateRequested');
  });

  it('derives edit requests from UpdateRequested status', () => {
    const rows = parseAdminSubmissionRows([
      { id: 'sub-1', title: 'Bài A', status: 4, submittedBy: 'user-1' },
      { id: 'sub-2', title: 'Bài B', status: 'Approved', submittedBy: 'user-2' },
    ]);
    const edit = deriveEditRecordingRequests(rows, new Map([['user-1', 'Nguyễn A']]));
    expect(edit).toHaveLength(1);
    expect(edit[0]?.id).toBe('sub-1');
    expect(edit[0]?.status).toBe('pending');
    expect(edit[0]?.contributorName).toBe('Nguyễn A');
  });

  it('returns empty delete requests (no swagger status)', () => {
    const rows = parseAdminSubmissionRows([{ id: 'sub-1', title: 'X', status: 'Pending' }]);
    expect(deriveDeleteRecordingRequests(rows)).toEqual([]);
  });
});
