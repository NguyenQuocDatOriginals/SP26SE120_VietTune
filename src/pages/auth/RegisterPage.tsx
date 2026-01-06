import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Input from "@/components/common/Input";
import { RegisterForm } from "@/types";
import toast from "react-hot-toast";
import backgroundImage from "@/components/image/Đàn bầu.png";
import logo from "@/components/image/VietTune logo.png";
import TermsAndConditions from "@/components/features/TermsAndConditions";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
          className="spotlight-container backdrop-blur-xl bg-white/20 p-4 rounded-2xl shadow-2xl border border-white/40 space-y-1.5"
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
              className="w-16 h-16 object-contain mb-1 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const lastPage = localStorage.getItem("lastVisitedPage");
                navigate(lastPage || "/");
              }}
            />
            <h2 className="text-center text-xl font-bold text-white">
              Create your account
            </h2>
            <p className="mt-1 text-center text-sm text-white">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-emerald-300 hover:text-green-500 active:text-green-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="space-y-0.5">
            <Input
              label="Full name"
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
              label="Confirm password"
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
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-emerald-300 hover:text-emerald-400 active:text-emerald-500 underline transition-colors"
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-liquid-glass-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create account"}
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
