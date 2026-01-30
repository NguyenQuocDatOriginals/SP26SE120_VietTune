import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ErrorBoundary from "@/components/common/ErrorBoundary";
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
    <div className="flex flex-col min-h-screen min-w-0 overflow-x-hidden" style={{ backgroundColor: '#FFF2D6' }}>
      <Header />
      <main className="flex-grow min-w-0 w-full">
        <ErrorBoundary region="main">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
