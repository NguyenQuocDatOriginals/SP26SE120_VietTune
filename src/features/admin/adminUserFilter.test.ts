import { describe, expect, it } from 'vitest';

import { filterAdminUsers, paginateAdminUsers } from './adminUserFilter';

import type { AggregatedUser } from '@/features/admin/adminDashboardTypes';
import { UserRole } from '@/types';

const USERS: AggregatedUser[] = [
  {
    id: '1',
    username: 'nguyen_van_a',
    email: 'a@test.com',
    fullName: 'Nguyễn Văn A',
    role: UserRole.CONTRIBUTOR,
    status: 'Active',
    contributionCount: 3,
    approvedCount: 2,
    rejectedCount: 1,
  },
  {
    id: '2',
    username: 'expert_b',
    email: 'expert@test.com',
    fullName: 'Trần Expert',
    role: UserRole.EXPERT,
    status: 'Inactive',
    contributionCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  },
  {
    id: '3',
    username: 'researcher_c',
    email: 'research@test.com',
    fullName: 'Lê Researcher',
    role: UserRole.RESEARCHER,
    status: 'Active',
    contributionCount: 1,
    approvedCount: 1,
    rejectedCount: 0,
  },
];

describe('filterAdminUsers', () => {
  it('returns all users when filters are all', () => {
    expect(
      filterAdminUsers(USERS, { search: '', role: 'all', status: 'all' }),
    ).toHaveLength(3);
  });

  it('filters by role', () => {
    const result = filterAdminUsers(USERS, {
      search: '',
      role: UserRole.EXPERT,
      status: 'all',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });

  it('filters by status', () => {
    const result = filterAdminUsers(USERS, {
      search: '',
      role: 'all',
      status: 'Inactive',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe('expert_b');
  });

  it('searches by Vietnamese name without accents', () => {
    const result = filterAdminUsers(USERS, {
      search: 'nguyen van',
      role: 'all',
      status: 'all',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.fullName).toBe('Nguyễn Văn A');
  });

  it('searches by email', () => {
    const result = filterAdminUsers(USERS, {
      search: 'research@test',
      role: 'all',
      status: 'all',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.role).toBe(UserRole.RESEARCHER);
  });
});

describe('paginateAdminUsers', () => {
  it('paginates items', () => {
    const page1 = paginateAdminUsers(USERS, 1, 2);
    expect(page1.items).toHaveLength(2);
    expect(page1.totalPages).toBe(2);
    expect(page1.safePage).toBe(1);

    const page2 = paginateAdminUsers(USERS, 2, 2);
    expect(page2.items).toHaveLength(1);
    expect(page2.safePage).toBe(2);
  });

  it('clamps page to valid range', () => {
    const out = paginateAdminUsers(USERS, 99, 2);
    expect(out.safePage).toBe(2);
    expect(out.items).toHaveLength(1);
  });
});
