import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import KnowledgeBasePanel from '@/components/features/kb/KnowledgeBasePanel';
import AdminBreadcrumbs from '@/features/admin/shell/AdminBreadcrumbs';
import { buildAdminBreadcrumbItems } from '@/features/admin/shell/adminBreadcrumbUtils';

export default function KnowledgeBasePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openCreateOnMount, setOpenCreateOnMount] = useState(false);

  useEffect(() => {
    const st = location.state as { kbOpenCreate?: boolean } | null | undefined;
    if (st?.kbOpenCreate) {
      setOpenCreateOnMount(true);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const adminBreadcrumbItems = useMemo(
    () => buildAdminBreadcrumbItems(location.pathname, null),
    [location.pathname],
  );

  return (
    <KnowledgeBasePanel
      listBackTo="/admin"
      openCreateOnMount={openCreateOnMount}
      breadcrumbSlot={
        <div className="mb-4">
          <AdminBreadcrumbs items={adminBreadcrumbItems} />
        </div>
      }
    />
  );
}
