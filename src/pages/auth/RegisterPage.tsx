import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Input from "@/components/common/Input";
import { RegisterForm } from "@/types";
import toast from "react-hot-toast";
import backgroundImage from "@/components/image/Đàn bầu.png";
import logo from "@/components/image/VietTune logo.png";
import TermsAndConditions from "@/components/features/TermsAndConditions";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Registration failed. Please try again."
          : "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(185, 28, 28, 0.85), rgba(127, 29, 29, 0.9)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-lg w-full">
        <form
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="VietTune Logo"
              className="w-16 h-16 object-contain mb-2 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const lastPage = localStorage.getItem("lastVisitedPage");
                navigate(lastPage || "/");
              }}
            />
            <h2 className="text-center text-2xl font-bold text-secondary-800">
              Tạo tài khoản của bạn
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 active:text-primary-800"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Họ và tên"
              {...register("fullName", {
                required: "Họ và tên là bắt buộc",
              })}
              error={errors.fullName?.message}
            />

            <Input
              label="Tên người dùng"
              {...register("username", {
                required: "Tên người dùng là bắt buộc",
                minLength: {
                  value: 3,
                  message: "Tên người dùng phải có ít nhất 3 ký tự",
                },
              })}
              error={errors.username?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Địa chỉ email không hợp lệ",
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Mật khẩu"
              type="password"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === password || "Mật khẩu không khớp",
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-2 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-secondary-600">
              Tôi đồng ý với{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-primary-600 hover:text-primary-700 active:text-primary-800 underline transition-colors"
              >
                Điều khoản và Điều kiện
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-liquid-glass-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>
      </div>

      <TermsAndConditions
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </div>
  );
}
