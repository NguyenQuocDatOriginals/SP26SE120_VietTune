import { useEffect, useMemo, useState } from 'react';

import {
  EXPLORE_STATIC_OPTIONS,
  type ExploreFilterOptions,
} from '@/constants/exploreFilterOptions';
import { referenceDataService } from '@/services/referenceDataService';

type DynamicOptions = Pick<ExploreFilterOptions, 'ethnicities' | 'instruments' | 'ceremonies' | 'communes'>;

let optionsCache: DynamicOptions | null = null;

export function useExploreFilterOptions(): ExploreFilterOptions {
  const [dynamicOptions, setDynamicOptions] = useState<DynamicOptions>(
    optionsCache ?? { ethnicities: [], instruments: [], ceremonies: [], communes: [] },
  );

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (optionsCache) {
        setDynamicOptions(optionsCache);
        return;
      }
      
      const [ethnicGroups, instruments, ceremonies, communes] = await Promise.allSettled([
        referenceDataService.getEthnicGroups(),
        referenceDataService.getInstruments(),
        referenceDataService.getCeremonies(),
        referenceDataService.getCommunes(),
      ]);
      if (cancelled) return;

      const next: DynamicOptions = {
        ethnicities:
          ethnicGroups.status === 'fulfilled'
            ? ethnicGroups.value.map((x) => ({ id: x.id, label: x.name }))
            : [],
        instruments:
          instruments.status === 'fulfilled'
            ? instruments.value.map((x) => ({ id: x.id, label: x.name }))
            : [],
        ceremonies:
          ceremonies.status === 'fulfilled'
            ? ceremonies.value.map((x) => ({ id: x.id, label: x.name }))
            : [],
        communes:
          communes.status === 'fulfilled'
            ? communes.value.map((x) => ({ id: x.id, label: x.name }))
            : [],
      };

      optionsCache = next;
      setDynamicOptions(next);
    };

    void loadData();

    const handleRefDataUpdate = () => {
      optionsCache = null;
      void loadData();
    };

    window.addEventListener('viettune:refdata-updated', handleRefDataUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('viettune:refdata-updated', handleRefDataUpdate);
    };
  }, []);

  return useMemo(
    () => ({
      ...EXPLORE_STATIC_OPTIONS,
      ...dynamicOptions,
    }),
    [dynamicOptions],
  );
}
