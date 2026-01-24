import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/types";
export default function AdminGuard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  if (!user) return null;
  if (!isAdmin) return null;

  return <Outlet />;
}