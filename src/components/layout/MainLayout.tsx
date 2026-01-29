import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { setItem } from "@/services/storageService";

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    // Ghi nhớ trang truy cập cuối cùng (trừ các trang đăng nhập/đăng ký)
    const currentPath = location.pathname;
    if (currentPath !== "/login" && currentPath !== "/register") {
      void setItem("lastVisitedPage", currentPath);
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#FFF2D6' }}>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
