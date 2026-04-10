// [VI] Nhập (import) các phụ thuộc cho file.
import type { LucideIcon } from 'lucide-react';
// [VI] Nhập (import) các phụ thuộc cho file.
import { Compass, Upload, UserPlus, ShieldCheck, FileCheck } from 'lucide-react';

// [VI] Nhập (import) các phụ thuộc cho file.
import type { User } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { UserRole } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type LayoutFeatureItem = {
// [VI] Thực thi một bước trong luồng xử lý.
  icon: LucideIcon;
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description: string;
// [VI] Thực thi một bước trong luồng xử lý.
  to: string;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/** Cùng logic với HomePage (hero features) — dùng cho header strip. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getLayoutFeatureItems(user: User | null): LayoutFeatureItem[] {
// [VI] Khai báo biến/hằng số.
  const isExpert = user?.role === UserRole.EXPERT;
// [VI] Khai báo biến/hằng số.
  const useGuestFeatures = !user || user?.role === UserRole.ADMIN || !isExpert;
// [VI] Khai báo biến/hằng số.
  const isAdmin = user?.role === UserRole.ADMIN;

// [VI] Rẽ nhánh điều kiện (if).
  if (useGuestFeatures) {
// [VI] Trả về kết quả từ hàm.
    return [
// [VI] Thực thi một bước trong luồng xử lý.
      {
// [VI] Thực thi một bước trong luồng xử lý.
        icon: Compass,
// [VI] Thực thi một bước trong luồng xử lý.
        title: 'Khám phá âm nhạc dân tộc',
// [VI] Thực thi một bước trong luồng xử lý.
        description: 'Duyệt qua kho tàng âm nhạc truyền thống phong phú từ khắp mọi miền đất nước',
// [VI] Thực thi một bước trong luồng xử lý.
        to: '/explore',
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      ...(isAdmin
// [VI] Thực thi một bước trong luồng xử lý.
        ? [
// [VI] Thực thi một bước trong luồng xử lý.
            {
// [VI] Thực thi một bước trong luồng xử lý.
              icon: UserPlus,
// [VI] Thực thi một bước trong luồng xử lý.
              title: 'Cấp tài khoản Chuyên gia',
// [VI] Thực thi một bước trong luồng xử lý.
              description:
// [VI] Thực thi một bước trong luồng xử lý.
                'Tạo tài khoản Chuyên gia mới để kiểm duyệt và xác minh bản thu âm nhạc truyền thống',
// [VI] Thực thi một bước trong luồng xử lý.
              to: '/admin/create-expert',
// [VI] Thực thi một bước trong luồng xử lý.
            },
// [VI] Thực thi một bước trong luồng xử lý.
          ]
// [VI] Thực thi một bước trong luồng xử lý.
        : []),
// [VI] Thực thi một bước trong luồng xử lý.
      ...(isAdmin
// [VI] Thực thi một bước trong luồng xử lý.
        ? [
// [VI] Thực thi một bước trong luồng xử lý.
            {
// [VI] Thực thi một bước trong luồng xử lý.
              icon: ShieldCheck,
// [VI] Thực thi một bước trong luồng xử lý.
              title: 'Quản trị hệ thống',
// [VI] Thực thi một bước trong luồng xử lý.
              description: 'Quản lý người dùng, phân tích bộ sưu tập và kiểm duyệt nội dung',
// [VI] Thực thi một bước trong luồng xử lý.
              to: '/admin',
// [VI] Thực thi một bước trong luồng xử lý.
            },
// [VI] Thực thi một bước trong luồng xử lý.
          ]
// [VI] Thực thi một bước trong luồng xử lý.
        : [
// [VI] Thực thi một bước trong luồng xử lý.
            {
// [VI] Thực thi một bước trong luồng xử lý.
              icon: Upload,
// [VI] Thực thi một bước trong luồng xử lý.
              title: 'Đóng góp bản thu',
// [VI] Thực thi một bước trong luồng xử lý.
              description:
// [VI] Thực thi một bước trong luồng xử lý.
                'Chia sẻ bản thu âm nhạc truyền thống của bạn để cùng gìn giữ di sản văn hóa',
// [VI] Thực thi một bước trong luồng xử lý.
              to: '/upload',
// [VI] Thực thi một bước trong luồng xử lý.
            },
// [VI] Thực thi một bước trong luồng xử lý.
          ]),
// [VI] Thực thi một bước trong luồng xử lý.
    ];
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Trả về kết quả từ hàm.
  return [
// [VI] Thực thi một bước trong luồng xử lý.
    {
// [VI] Thực thi một bước trong luồng xử lý.
      icon: ShieldCheck,
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Kiểm duyệt bản thu',
// [VI] Thực thi một bước trong luồng xử lý.
      description:
// [VI] Thực thi một bước trong luồng xử lý.
        'Xem xét và phê duyệt các bản thu âm nhạc truyền thống được đóng góp bởi cộng đồng',
// [VI] Thực thi một bước trong luồng xử lý.
      to: '/moderation',
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    {
// [VI] Thực thi một bước trong luồng xử lý.
      icon: FileCheck,
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Quản lý bản thu đã được kiểm duyệt',
// [VI] Thực thi một bước trong luồng xử lý.
      description: 'Quản lý và theo dõi các bản thu đã được phê duyệt trong hệ thống',
// [VI] Thực thi một bước trong luồng xử lý.
      to: '/approved-recordings',
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  ];
// [VI] Thực thi một bước trong luồng xử lý.
}
