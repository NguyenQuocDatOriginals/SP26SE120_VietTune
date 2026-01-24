import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/common/BackButton";
import Input from "@/components/common/Input";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { UserRole, type User } from "@/types";
import { notify } from "@/stores/notificationStore";

export default function CreateExpertPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [expertForm, setExpertForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [expertFormErrors, setExpertFormErrors] = useState<{
    username?: string;
    email?: string;
    fullName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Redirect if not admin
  if (!user || user.role !== UserRole.ADMIN) {
    navigate("/");
    return null;
  }

  const validateExpertForm = (): boolean => {
    const errors: {
      username?: string;
      email?: string;
      fullName?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!expertForm.username.trim()) {
      errors.username = "Tên người dùng là bắt buộc";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(expertForm.username.trim())) {
      errors.username = "Tên người dùng 3-20 ký tự, chỉ chữ, số và dấu gạch dưới";
    }
    if (!expertForm.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(expertForm.email.trim())) {
      errors.email = "Địa chỉ email không hợp lệ";
    }
    if (!expertForm.fullName.trim()) {
      errors.fullName = "Họ và tên là bắt buộc";
    }
    if (!expertForm.password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (expertForm.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!expertForm.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (expertForm.confirmPassword !== expertForm.password) {
      errors.confirmPassword = "Mật khẩu không khớp";
    }
    setExpertFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateExpert = () => {
    if (!validateExpertForm()) return;

    try {
      // Check if username already exists
      const oRaw = localStorage.getItem("users_overrides");
      const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, User>) : {};
      const existingUser = Object.values(overrides).find(
        (u) => u.username.toLowerCase() === expertForm.username.trim().toLowerCase()
      );
      if (existingUser) {
        setExpertFormErrors({ username: "Tên người dùng đã tồn tại" });
        return;
      }

      // Create new EXPERT user
      const newExpertId = `expert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newExpert: User = {
        id: newExpertId,
        username: expertForm.username.trim(),
        email: expertForm.email.trim(),
        fullName: expertForm.fullName.trim(),
        role: UserRole.EXPERT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to users_overrides
      overrides[newExpertId] = newExpert;
      localStorage.setItem("users_overrides", JSON.stringify(overrides));

      // Store password for demo (Chuyên gia đổi mật khẩu sau trong ProfilePage)
      try {
        const pRaw = localStorage.getItem("demo_passwords");
        const passwords = pRaw ? (JSON.parse(pRaw) as Record<string, string>) : {};
        passwords[newExpertId] = expertForm.password;
        localStorage.setItem("demo_passwords", JSON.stringify(passwords));
      } catch (err) {
        console.warn("Failed to store expert password", err);
      }

      // Reset form
      setExpertForm({
        username: "",
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
      });
      setExpertFormErrors({});

      notify.success("Thành công", `Đã tạo tài khoản Chuyên gia "${newExpert.username}" thành công.`);
    } catch (e) {
      notify.error("Lỗi", "Không thể tạo tài khoản Chuyên gia.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: "#FFFCF5" }}>
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
                <UserPlus className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
              </div>
              Cấp tài khoản Chuyên gia
            </h2>
            <p className="text-neutral-700 font-medium leading-relaxed mb-6">
              Tạo tài khoản Chuyên gia mới để họ có thể kiểm duyệt và xác minh bản thu âm nhạc truyền thống.
            </p>
            <div className="max-w-2xl">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tên người dùng"
                    value={expertForm.username}
                    onChange={(e) => {
                      setExpertForm({ ...expertForm, username: e.target.value });
                      if (expertFormErrors.username) {
                        setExpertFormErrors({ ...expertFormErrors, username: undefined });
                      }
                    }}
                    error={expertFormErrors.username}
                    required
                    placeholder="Nhập tên người dùng"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={expertForm.email}
                    onChange={(e) => {
                      setExpertForm({ ...expertForm, email: e.target.value });
                      if (expertFormErrors.email) {
                        setExpertFormErrors({ ...expertFormErrors, email: undefined });
                      }
                    }}
                    error={expertFormErrors.email}
                    required
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
                <Input
                  label="Họ và tên"
                  value={expertForm.fullName}
                  onChange={(e) => {
                    setExpertForm({ ...expertForm, fullName: e.target.value });
                    if (expertFormErrors.fullName) {
                      setExpertFormErrors({ ...expertFormErrors, fullName: undefined });
                    }
                  }}
                  error={expertFormErrors.fullName}
                  required
                  placeholder="Nhập họ và tên"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Mật khẩu"
                    type="password"
                    value={expertForm.password}
                    onChange={(e) => {
                      setExpertForm({ ...expertForm, password: e.target.value });
                      if (expertFormErrors.password) {
                        setExpertFormErrors({ ...expertFormErrors, password: undefined });
                      }
                    }}
                    error={expertFormErrors.password}
                    required
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  />
                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={expertForm.confirmPassword}
                    onChange={(e) => {
                      setExpertForm({ ...expertForm, confirmPassword: e.target.value });
                      if (expertFormErrors.confirmPassword) {
                        setExpertFormErrors({ ...expertFormErrors, confirmPassword: undefined });
                      }
                    }}
                    error={expertFormErrors.confirmPassword}
                    required
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={handleCreateExpert}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="h-5 w-5" strokeWidth={2.5} />
                    Tạo tài khoản Chuyên gia
                  </button>
                  <button
                    onClick={() => {
                      setExpertForm({
                        username: "",
                        email: "",
                        fullName: "",
                        password: "",
                        confirmPassword: "",
                      });
                      setExpertFormErrors({});
                    }}
                    className="px-6 py-3 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}