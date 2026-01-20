import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import Input from "@/components/common/Input";
import { LoginForm } from "@/types";
import toast from "react-hot-toast";
import backgroundImage from "@/components/image/Đàn bầu.png";
import logo from "@/components/image/VietTune logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Login failed. Please try again."
          : "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-1 px-4 sm:px-6 lg:px-8"
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
              Đăng nhập vào VietTune
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600">
              Hoặc{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700 active:text-primary-800"
              >
                tạo tài khoản mới
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Tên người dùng hoặc Email"
              {...register("usernameOrEmail", {
                required: "Tên người dùng hoặc Email là bắt buộc",
              })}
              error={errors.usernameOrEmail?.message}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-2 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-secondary-600"
              >
                Ghi nhớ tôi
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-700 active:text-primary-800"
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-liquid-glass-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
