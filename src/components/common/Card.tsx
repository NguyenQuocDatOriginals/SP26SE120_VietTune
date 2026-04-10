/**
 * Tài liệu hoá tiếng Việt cho file TSX.
 * Ghi chú: TSX/JSX không thể chú thích "từng dòng" bằng `//` trong phần JSX mà không phá cú pháp,
 * nên file này được chú thích theo khối/chức năng chính (component/handler/luồng dữ liệu).
 */
import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
}

/**

 * Component trang (page).

 * - Trách nhiệm: hiển thị UI và điều phối các thao tác chính của trang.

 */


export default function Card({ children, className, variant = 'default' }: CardProps) {
  const variants = {
    default: 'shadow-lg backdrop-blur-sm',
    bordered: 'border border-neutral-200/80 shadow-lg backdrop-blur-sm',
    elevated: 'shadow-xl backdrop-blur-sm',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl p-6 transition-all duration-300 hover:shadow-xl',
        variants[variant],
        className,
      )}
      style={{ backgroundColor: '#FFFCF5' }}
    >
      {children}
    </div>
  );
}
