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
        toast.success("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
          : "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full">
        <form
          className="bg-white p-6 rounded-2xl shadow-xl space-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="VietTune Logo"
              className="w-12 h-12 object-contain mb-1 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const lastPage = localStorage.getItem("lastVisitedPage");
                navigate(lastPage || "/");
              }}
            />
            <h2 className="text-center text-xl font-bold text-neutral-800">
              Đăng nhập vào VietTune
            </h2>
            <p className="text-center text-sm text-neutral-600">
              Hoặc{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700 active:text-primary-800"
              >
                tạo tài khoản mới
              </Link>
            </p>
          </div>

          <div className="space-y-3">
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-3.5 w-3.5 bg-white text-primary-600 focus:ring-primary-500 border-2 border-neutral-400 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-neutral-700"
              >
                Ghi nhớ tôi
              </label>
            </div>

            <a
              href="#"
              className="font-medium text-primary-600 hover:text-primary-700 active:text-primary-800"
            >
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
