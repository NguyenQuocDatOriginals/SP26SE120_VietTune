import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/types";
export default function AdminGuard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${redirect}`, { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, navigate, location.pathname]);

  if (!user) return null;
  if (!isAdmin) return null;

  return <Outlet />;
}