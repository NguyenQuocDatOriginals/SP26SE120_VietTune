import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-neutral-800 mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-neutral-600 mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị chuyển đi.
        </p>
        <Link to="/" className="btn-liquid-glass-primary inline-block">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}