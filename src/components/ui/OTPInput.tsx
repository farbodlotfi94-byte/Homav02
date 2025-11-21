import { OTPInput as BaseOTPInput } from "input-otp";
import { cn } from "./utils";

interface OTPInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  length?: number;
}

export function OTPInputField({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  length = 6,
}: OTPInputFieldProps) {
  return (
    <BaseOTPInput
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      maxLength={length}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label="کد تایید ۶ رقمی"
      render={({ slots }) => (
        <div className="flex w-full gap-2 justify-center" dir="ltr">
          {slots.map((slot) => (
            <div
              key={slot.index}
              className={cn(
                "relative flex h-14 w-12 flex-col items-center justify-center rounded-lg border-2 text-3xl font-semibold transition-all duration-150",
                slot.isActive && "border-accent ring-2 ring-accent/20",
                slot.isFilled && !error && "border-gray-300 text-gray-900",
                error && "border-destructive text-destructive",
                disabled && "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
                !slot.isFilled && !error && "border-gray-200",
              )}
            >
              {slot.char ? (
                slot.char
              ) : slot.isActive ? (
                <div className="h-8 w-0.5 bg-accent animate-pulse" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    />
  );
}

