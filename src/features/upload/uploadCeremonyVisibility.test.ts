import { describe, expect, it } from 'vitest';

import type { CeremonyItem } from '@/services/referenceDataService';

import { shouldShowUploadAdminCopyrightSection } from './uploadCeremonyVisibility';

const ceremonies: CeremonyItem[] = [
  { id: '1', name: 'Lễ cưới', type: 'Wedding' },
  { id: '2', name: 'Lễ hội Gầu Tào', type: 'Festival' },
  { id: '3', name: 'Hát then', type: 'Ritual' },
  { id: '4', name: 'Ca trù', type: 'Daily' },
];

describe('shouldShowUploadAdminCopyrightSection', () => {
  it('shows for ritual / wedding / funeral types', () => {
    expect(shouldShowUploadAdminCopyrightSection('Lễ cưới', '', ceremonies)).toBe(true);
    expect(shouldShowUploadAdminCopyrightSection('Hát then', '', ceremonies)).toBe(true);
  });

  it('hides for festival / daily', () => {
    expect(shouldShowUploadAdminCopyrightSection('Lễ hội Gầu Tào', '', ceremonies)).toBe(false);
    expect(shouldShowUploadAdminCopyrightSection('Ca trù', '', ceremonies)).toBe(false);
  });

  it('hides when empty or unknown label', () => {
    expect(shouldShowUploadAdminCopyrightSection('', '', ceremonies)).toBe(false);
    expect(shouldShowUploadAdminCopyrightSection('Không tồn tại', '', ceremonies)).toBe(false);
  });

  it('resolves Khác + custom label', () => {
    expect(shouldShowUploadAdminCopyrightSection('Khác', 'Hát then', ceremonies)).toBe(true);
    expect(shouldShowUploadAdminCopyrightSection('Khác', 'Ca trù', ceremonies)).toBe(false);
  });
});
