import { Recording } from '@/types';

export type ResearcherCatalogSource = 'api-filter' | 'empty' | 'error';

export type ResearcherSearchResult = Recording;

export interface ResearcherAnalysisRecord extends Recording {
  normalizedBaseTitle?: string;
  mappedEthnicity?: string;
  mappedInstruments?: string[];
}

export interface ResearcherUiRecord extends Recording {
  uiTitle: string;
  uiSubtitle: string;
}

export type ResearcherFilterDropdownKey = 'ethnic' | 'instrument' | 'ceremony' | 'region' | 'commune';

export type CompareWizardStep = 1 | 2 | 3;

export interface ComparisonFacetSame {
  label: string;
  value: string;
}

export interface ComparisonFacetDiff {
  label: string;
  leftValue: string;
  rightValue: string;
}

export interface ComparisonFacets {
  same: ComparisonFacetSame[];
  different: ComparisonFacetDiff[];
}

/** Label-based filters — values must match facet options derived from the approved catalog. */
export interface SearchFiltersState {
  ethnicity: string;
  instrument: string;
  region: string;
  ceremony: string;
  commune: string;
}

export interface ResearcherFacetOptions {
  ethnicities: string[];
  instruments: string[];
  ceremonies: string[];
  regions: string[];
  communes: string[];
}

export const EMPTY_SEARCH_FILTERS: SearchFiltersState = {
  ethnicity: '',
  instrument: '',
  region: '',
  ceremony: '',
  commune: '',
};

export interface ChatCitation {
  recordingId: string;
  label: string;
}

/** Messages in the researcher portal QA tab (VietTune Intelligence). */
export interface ResearcherPortalChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: ChatCitation[];
}

/** @deprecated Use `ResearcherGraphSelection` from `@/features/knowledge-graph/utils/researcherGraphUx`. */
export type ResearcherSelectedGraphNode = {
  type: 'instrument' | 'ethnicity';
  name: string;
} | null;

export type { ResearcherGraphTabView, ResearcherGraphSelection } from '@/features/knowledge-graph/utils/researcherGraphUx';
