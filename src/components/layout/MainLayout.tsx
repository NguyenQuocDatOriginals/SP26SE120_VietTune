import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AudioPlayer from "../features/AudioPlayer";
import { initializeButtonSpotlights } from "@/utils/buttonSpotlight";

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    // Khởi tạo hiệu ứng spotlight cho tất cả các nút liquid glass
    const cleanup = initializeButtonSpotlights();
    return cleanup;
  }, []);

  useEffect(() => {
    // Ghi nhớ trang truy cập cuối cùng (trừ các trang đăng nhập/đăng ký)
    const currentPath = location.pathname;
    if (currentPath !== "/login" && currentPath !== "/register") {
      localStorage.setItem("lastVisitedPage", currentPath);
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-900 via-emerald-900 to-amber-900">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  );
}