import type { Dispatch, SetStateAction } from 'react';

import AdminDashboardAiMonitoringPanel from '@/components/admin/AdminDashboardAiMonitoringPanel';
import AdminDashboardAnalyticsPanel from '@/components/admin/AdminDashboardAnalyticsPanel';
import AdminDashboardModerationPanel from '@/components/admin/AdminDashboardModerationPanel';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import type { ContributorLeaderboardLoadState } from '@/components/features/analytics/ContributorLeaderboard';
import type {
  AdminDashboardSectionId,
  AggregatedUser,
  ExpertPerformanceRow,
  LegacyAdminPanelId,
} from '@/features/admin/adminDashboardTypes';
import type {
  DeleteRecordingRequest,
  EditRecordingRequest,
  ExpertAccountDeletionRequest,
  LocalRecording,
} from '@/types';
import type { ContributorRow } from '@/types/analytics';

/** Matches `AdminDashboardAnalyticsPanel` remote instrument list shape. */
export type AdminDashboardRemoteInstruments =
  | { id: string; name: string; category: string | undefined }[]
  | null;

export type AdminDashboardPanelsProps = {
  step: AdminDashboardSectionId;
  remoteUsersLoadState: 'idle' | 'loading' | 'ok' | 'error';
  usersForTable: AggregatedUser[];
  showUsersLoadingHint: boolean;
  setShowUsersLoadingHint: Dispatch<SetStateAction<boolean>>;
  load: (opts?: { showUserLoadingHint?: boolean }) => Promise<void>;
  onOpenUserGuide: () => void;
  getRoleNameVi: (role: string) => string;
  onAssignRole: (userId: string, newRole: string) => void | Promise<void>;
  onRequestDeleteUser: (p: { id: string; username: string }) => void;
  onReactivateUser: (userId: string) => void | Promise<void>;
  remoteTotalRecordings: number | null;
  recordingsLength: number;
  remoteEthnicGroupsLoadState: 'idle' | 'loading' | 'ok' | 'error';
  ethnicGroupCount: number;
  allUsersCount: number;
  remoteInstrumentCount: number | null;
  remoteInstruments: AdminDashboardRemoteInstruments;
  monthlyCountsFinal: Record<string, number>;
  monthlyTrendIsEstimated: boolean;
  analyticsContributors: ContributorRow[] | null;
  analyticsContributorsLoadState: ContributorLeaderboardLoadState;
  avgExpertAccuracy: number | null;
  aiFlaggedCount: number | null;
  remoteKbCount: number | null;
  expertPerformanceRows: ExpertPerformanceRow[] | null;
  onFlaggedCountChange: Dispatch<SetStateAction<number | null>>;
  currentUserId: string | undefined;
  legacyPanel: LegacyAdminPanelId | null;
  setLegacyPanel: Dispatch<SetStateAction<LegacyAdminPanelId | null>>;
  deleteRecordingRequests: DeleteRecordingRequest[];
  editRecordingRequests: EditRecordingRequest[];
  expertOptions: { id: string; username: string; fullName?: string }[];
  forwardDeleteExpertId: { requestId: string; expertId: string } | null;
  setForwardDeleteExpertId: Dispatch<
    SetStateAction<{ requestId: string; expertId: string } | null>
  >;
  pendingExpertDeletions: ExpertAccountDeletionRequest[];
  onRequestExpertDeletionApprove: Dispatch<SetStateAction<ExpertAccountDeletionRequest | null>>;
  recordings: LocalRecording[];
  onRequestRemoveRecording: (p: { id: string; title?: string }) => void;
};

/**
 * Renders the active admin dashboard workspace (users / analytics / AI / moderation).
 * Keeps `AdminDashboard.tsx` thinner — panels stay in `components/admin/*`.
 */
export default function AdminDashboardPanels(props: AdminDashboardPanelsProps) {
  const { step } = props;

  if (step === 'users') {
    return (
      <AdminUserManagement
        remoteUsersLoadState={props.remoteUsersLoadState}
        usersForTable={props.usersForTable}
        showUsersLoadingHint={props.showUsersLoadingHint}
        setShowUsersLoadingHint={props.setShowUsersLoadingHint}
        load={props.load}
        onOpenGuide={props.onOpenUserGuide}
        getRoleNameVi={props.getRoleNameVi}
        onAssignRole={props.onAssignRole}
        onRequestDeleteUser={props.onRequestDeleteUser}
        onReactivateUser={props.onReactivateUser}
      />
    );
  }

  if (step === 'analytics') {
    return (
      <AdminDashboardAnalyticsPanel
        remoteTotalRecordings={props.remoteTotalRecordings}
        recordingsLength={props.recordingsLength}
        remoteEthnicGroupsLoadState={props.remoteEthnicGroupsLoadState}
        ethnicGroupCount={props.ethnicGroupCount}
        allUsersCount={props.allUsersCount}
        remoteInstrumentCount={props.remoteInstrumentCount}
        remoteInstruments={props.remoteInstruments}
        monthlyCountsFinal={props.monthlyCountsFinal}
        monthlyTrendIsEstimated={props.monthlyTrendIsEstimated}
        analyticsContributors={props.analyticsContributors}
        analyticsContributorsLoadState={props.analyticsContributorsLoadState}
        onRefreshDashboard={() => void props.load()}
      />
    );
  }

  if (step === 'aiMonitoring') {
    return (
      <AdminDashboardAiMonitoringPanel
        avgExpertAccuracy={props.avgExpertAccuracy}
        aiFlaggedCount={props.aiFlaggedCount}
        remoteKbCount={props.remoteKbCount}
        expertPerformanceRows={props.expertPerformanceRows}
        onFlaggedCountChange={(n) => props.onFlaggedCountChange(n)}
        currentUserId={props.currentUserId}
      />
    );
  }

  return (
    <AdminDashboardModerationPanel
      legacyPanel={props.legacyPanel}
      setLegacyPanel={props.setLegacyPanel}
      deleteRecordingRequests={props.deleteRecordingRequests}
      editRecordingRequests={props.editRecordingRequests}
      expertOptions={props.expertOptions}
      forwardDeleteExpertId={props.forwardDeleteExpertId}
      setForwardDeleteExpertId={props.setForwardDeleteExpertId}
      pendingExpertDeletions={props.pendingExpertDeletions}
      onRequestExpertDeletionApprove={props.onRequestExpertDeletionApprove}
      recordings={props.recordings}
      onRequestRemoveRecording={props.onRequestRemoveRecording}
      onRefreshRequests={() => props.load()}
    />
  );
}
