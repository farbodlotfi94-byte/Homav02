import { ChangeEvent, InputHTMLAttributes } from "react";
import { cn } from "./utils";
import { normalizePersianDigits } from "../../utils/normalizeDigits";
import { validateAndNormalizePhone } from "../../utils/phoneValidator";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  onSubmit?: () => void;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  onValidationChange,
  onSubmit,
  error,
  className,
  ...props
}: PhoneInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const normalized = normalizePersianDigits(input);
    const digitsOnly = normalized.replace(/\D/g, "");

    let formatted = digitsOnly;
    if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 11)}`.trim();
    }

    onChange(formatted);

    if (onValidationChange) {
      const validation = validateAndNormalizePhone(digitsOnly);
      onValidationChange(validation.isValid);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onSubmit) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-1">
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        dir="ltr"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
        className={cn(
          "w-full rounded-[var(--radius-sm)] border border-border bg-input-background px-4 py-3 text-right text-base font-medium outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30",
          error && "border-destructive text-destructive focus:ring-destructive/40",
          className,
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="text-right text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

