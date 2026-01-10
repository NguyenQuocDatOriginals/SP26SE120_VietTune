import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-amber-900 via-emerald-900 to-amber-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-white mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị chuyển đi.
        </p>
        <Link to="/" className="btn-liquid-glass-primary inline-block">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}