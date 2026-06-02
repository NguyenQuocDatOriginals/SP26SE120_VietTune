/** Deep links & workspaces for archive governance (admin UI). Paths are app-relative. */
export type AdminGovernanceTarget = {
  id: string;
  to: string;
  title: string;
  description: string;
};

export const ADMIN_GOVERNANCE_TARGETS: AdminGovernanceTarget[] = [
  {
    id: 'master-data',
    to: '/admin/master-data',
    title: 'Dữ liệu tham chiếu',
    description: 'Nhạc cụ, dân tộc, taxonomy — chỉnh sửa an toàn với kiểm tra usage.',
  },
  {
    id: 'kb-admin',
    to: '/admin/knowledge-base',
    title: 'Knowledge Base (quản trị)',
    description: 'Soạn thảo, duyệt mục tri thức gắn với di sản âm nhạc.',
  },
  {
    id: 'researcher-kg',
    to: '/researcher',
    title: 'Cổng Researcher',
    description: 'Đồ thị tri thức, so sánh phổ, QA — góc nhìn chuyên sâu (ADMIN được phép vào).',
  },
  {
    id: 'kb-public',
    to: '/knowledge-base',
    title: 'Khám phá tri thức (public)',
    description: 'Giao diện đọc KB công khai — kiểm tra trải nghiệm người dùng cuối.',
  },
];
