import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-1">
            {label}
            {props.required && <span className="text-emerald-700 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
            "bg-white text-secondary-900 placeholder:text-secondary-400",
            error
              ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
              : "border-secondary-300 focus:ring-emerald-500 focus:border-transparent",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-emerald-300">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
