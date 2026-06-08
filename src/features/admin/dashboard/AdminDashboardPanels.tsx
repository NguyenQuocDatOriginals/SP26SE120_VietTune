import type { Dispatch, SetStateAction } from 'react';

import AdminDashboardAnalyticsPanel from '@/components/admin/AdminDashboardAnalyticsPanel';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import type { ContributorLeaderboardLoadState } from '@/components/features/analytics/ContributorLeaderboard';
import type { AdminDashboardSectionId, AggregatedUser } from '@/features/admin/adminDashboardTypes';
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
};

/**
 * Renders the active admin dashboard workspace (users / analytics).
 * Keeps `AdminDashboard.tsx` thinner — panels stay in `components/admin/*`.
 */
export default function AdminDashboardPanels(props: AdminDashboardPanelsProps) {
  const { step } = props;

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
