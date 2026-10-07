import { type InputHTMLAttributes, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <input
          ref={ref}
          className={`font-data px-3 py-2.5 rounded-md border bg-surface text-foreground placeholder:text-muted
            ${error ? "border-red-500" : "border-border"} 
            focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
          {...rest}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
FormField.displayName = "FormField";
