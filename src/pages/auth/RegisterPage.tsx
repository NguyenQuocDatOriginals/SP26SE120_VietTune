import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { RegisterForm } from "@/types";
import toast from "react-hot-toast";
import backgroundImage from "@/components/image/Đàn bầu.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
      className="min-h-screen flex items-center justify-center py-3 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full space-y-2">
        <div>
          <h2 className="mt-3 text-center text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-1 text-center text-sm text-white">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-300 hover:text-emerald-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form
          className="mt-2 space-y-3 backdrop-blur-xl bg-white/20 p-4 rounded-2xl shadow-2xl border border-white/40"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Input
              label="Full Name"
              {...register("fullName", {
                required: "Full name is required",
              })}
              error={errors.fullName?.message}
            />

            <Input
              label="Username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              error={errors.username?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 bg-white text-blue-600 focus:ring-blue-500 border-2 border-secondary-400 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-white">
              I agree to the{" "}
              <a href="#" className="text-emerald-300 hover:text-emerald-200">
                Terms and Conditions
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-emerald-700 hover:bg-emerald-800"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
