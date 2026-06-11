import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-boko-dark">{label}</label>
      )}
      <input
        className={`w-full border border-boko-border rounded-sm px-4 py-3 text-sm bg-white text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-boko-dark transition-colors ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-boko-dark">{label}</label>
      )}
      <textarea
        className={`w-full border border-boko-border rounded-sm px-4 py-3 text-sm bg-white text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-boko-dark transition-colors resize-none ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: TextareaProps & { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-boko-dark">{label}</label>
      )}
      <select
        className={`w-full border border-boko-border rounded-sm px-4 py-3 text-sm bg-white text-boko-dark focus:outline-none focus:border-boko-dark transition-colors appearance-none ${error ? "border-red-400" : ""} ${className}`}
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
