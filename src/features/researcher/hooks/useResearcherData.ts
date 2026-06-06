import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  ResearcherCatalogSource,
  ResearcherFacetOptions,
  ResearcherSearchResult,
  SearchFiltersState,
} from '../researcherPortalTypes';
import { EMPTY_SEARCH_FILTERS } from '../researcherPortalTypes';
import { mapRecordingToAnalysisRecord, mapRecordingToUiRecord } from '../researcherRecordingUtils';

import { logEvent, reportError, toReportableError } from '@/services/errorReporting';
import {
  referenceDataService,
  type CeremonyItem,
  type CommuneItem,
  type EthnicGroupItem,
  type InstrumentItem,
} from '@/services/referenceDataService';
import {
  applyResearcherFilters,
  buildResearcherFacetOptions,
  fetchRecordingsSearchByFilter,
} from '@/services/researcherRecordingFilterSearch';

const EMPTY_FACETS: ResearcherFacetOptions = {
  ethnicities: [],
  instruments: [],
  ceremonies: [],
  regions: [],
  communes: [],
};

export function useResearcherData() {
  const [filters, setFilters] = useState<SearchFiltersState>({ ...EMPTY_SEARCH_FILTERS });
  const [baseCatalog, setBaseCatalog] = useState<ResearcherSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [catalogSource, setCatalogSource] = useState<ResearcherCatalogSource>('empty');
  const [loadGeneration, setLoadGeneration] = useState(0);

  const [ethnicRefData, setEthnicRefData] = useState<EthnicGroupItem[]>([]);
  const [instrumentRefData, setInstrumentRefData] = useState<InstrumentItem[]>([]);
  const [ceremonyRefData, setCeremonyRefData] = useState<CeremonyItem[]>([]);
  const [communeRefData, setCommuneRefData] = useState<CommuneItem[]>([]);

  const activeFilterCount = useMemo(
    () =>
      [filters.ethnicity, filters.instrument, filters.region, filters.ceremony, filters.commune].filter(
        (x) => Boolean(x?.trim()),
      ).length,
    [filters],
  );

  const facetOptions = useMemo(
    () => (baseCatalog.length > 0 ? buildResearcherFacetOptions(baseCatalog) : EMPTY_FACETS),
    [baseCatalog],
  );

  const searchResults = useMemo(
    () => applyResearcherFilters(baseCatalog, filters),
    [baseCatalog, filters],
  );

  const analysisDataset = useMemo(
    () => searchResults.map(mapRecordingToAnalysisRecord),
    [searchResults],
  );

  const uiDerivedData = useMemo(() => searchResults.map(mapRecordingToUiRecord), [searchResults]);

  /** @deprecated Use searchResults — kept for existing components. */
  const approvedRecordings = searchResults;

  const EVENT_TYPES = useMemo(() => facetOptions.ceremonies, [facetOptions.ceremonies]);
  const ETHNICITIES = useMemo(() => facetOptions.ethnicities, [facetOptions.ethnicities]);
  const REGIONS = useMemo(() => facetOptions.regions, [facetOptions.regions]);
  const INSTRUMENTS = useMemo(() => facetOptions.instruments, [facetOptions.instruments]);
  const COMMUNES = useMemo(() => facetOptions.communes, [facetOptions.communes]);

  useEffect(() => {
    let cancelled = false;
    const loadRefData = async () => {
      const settled = await Promise.allSettled([
        referenceDataService.getEthnicGroups(),
        referenceDataService.getCeremonies(),
        referenceDataService.getInstruments(),
        referenceDataService.getCommunes(),
      ]);
      if (cancelled) return;

      const [ethnicOutcome, ceremonyOutcome, instrumentOutcome, communeOutcome] = settled;

      if (ethnicOutcome.status === 'fulfilled' && ethnicOutcome.value.length > 0) {
        setEthnicRefData(ethnicOutcome.value);
      } else if (ethnicOutcome.status === 'rejected') {
        reportError(toReportableError(ethnicOutcome.reason, 'Failed to load ethnic groups'), undefined, {
          region: 'researcher',
          refData: 'ethnicGroups',
        });
      }

      if (ceremonyOutcome.status === 'fulfilled' && ceremonyOutcome.value.length > 0) {
        setCeremonyRefData(ceremonyOutcome.value);
      } else if (ceremonyOutcome.status === 'rejected') {
        reportError(toReportableError(ceremonyOutcome.reason, 'Failed to load ceremonies'), undefined, {
          region: 'researcher',
          refData: 'ceremonies',
        });
      }

      if (instrumentOutcome.status === 'fulfilled' && instrumentOutcome.value.length > 0) {
        setInstrumentRefData(instrumentOutcome.value);
      } else if (instrumentOutcome.status === 'rejected') {
        reportError(toReportableError(instrumentOutcome.reason, 'Failed to load instruments'), undefined, {
          region: 'researcher',
          refData: 'instruments',
        });
      }

      if (communeOutcome.status === 'fulfilled' && communeOutcome.value.length > 0) {
        setCommuneRefData(communeOutcome.value);
      } else if (communeOutcome.status === 'rejected') {
        reportError(toReportableError(communeOutcome.reason, 'Failed to load communes'), undefined, {
          region: 'researcher',
          refData: 'communes',
        });
      }
    };

    void loadRefData();

    const handleRefDataUpdate = () => {
      void loadRefData();
    };

    window.addEventListener('viettune:refdata-updated', handleRefDataUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('viettune:refdata-updated', handleRefDataUpdate);
    };
  }, []);

  const loadResearcherCatalog = useCallback(async () => {
    setSearchLoading(true);
    setLoadError(null);

    try {
      const apiList = await fetchRecordingsSearchByFilter({ page: 1, pageSize: 500 });

      setBaseCatalog(apiList);
      if (apiList.length > 0) {
        setCatalogSource('api-filter');
        logEvent('ResearcherSearch', {
          source: 'api-filter',
          count: apiList.length,
          status: 'success',
        });
      } else {
        setCatalogSource('empty');
        logEvent('ResearcherSearch', { source: 'empty', count: 0, status: 'no-results' });
      }
    } catch (err) {
      reportError(toReportableError(err, 'Researcher catalog load API failed'), undefined, {
        region: 'researcher',
        stage: 'catalog_load',
      });
      setBaseCatalog([]);
      setCatalogSource('error');
      setLoadError(
        err instanceof Error ? err.message : 'Không thể tải kho bản thu. Vui lòng thử lại.',
      );
      logEvent('ResearcherSearch', { source: 'error', count: 0, status: 'failed', error: String(err) });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResearcherCatalog();
  }, [loadResearcherCatalog, loadGeneration]);

  const retryLoadCatalog = useCallback(() => {
    setLoadGeneration((g) => g + 1);
  }, []);

  return {
    filters,
    setFilters,
    baseCatalog,
    searchResults,
    analysisDataset,
    uiDerivedData,
    approvedRecordings,
    searchLoading,
    loadError,
    retryLoadCatalog,
    catalogSource,
    facetOptions,
    ethnicRefData,
    instrumentRefData,
    ceremonyRefData,
    communeRefData,
    activeFilterCount,
    ETHNICITIES,
    REGIONS,
    EVENT_TYPES,
    INSTRUMENTS,
    COMMUNES,
    loadResearcherCatalog,
  };
}
