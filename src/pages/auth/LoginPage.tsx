import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import Input from "@/components/common/Input";
import { LoginForm } from "@/types";
import toast from "react-hot-toast";
import backgroundImage from "@/components/image/Đàn bầu.png";
import logo from "@/components/image/VietTune logo.png";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (formRef.current)
      cleanupFunctions.push(addSpotlightEffect(formRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-lg w-full">
        <form
          ref={formRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 p-3 rounded-2xl shadow-2xl border border-white/40 space-y-0.5"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="VietTune Logo"
              className="w-12 h-12 object-contain mb-0.5 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const lastPage = localStorage.getItem("lastVisitedPage");
                navigate(lastPage || "/");
              }}
            />
            <h2 className="text-center text-lg font-bold text-white">
              Đăng nhập vào VietTune
            </h2>
            <p className="mt-0.5 text-center text-sm text-white">
              Hoặc{" "}
              <Link
                to="/register"
                className="font-medium text-emerald-300 hover:text-green-500 active:text-green-700"
              >
                tạo tài khoản mới
              </Link>
            </p>
          </div>

          <div className="space-y-0.5">
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
                className="h-4 w-4 bg-white text-blue-600 focus:ring-blue-500 border-2 border-secondary-400 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-white"
              >
                Ghi nhớ tôi
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-emerald-300 hover:text-green-500 active:text-green-700"
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
