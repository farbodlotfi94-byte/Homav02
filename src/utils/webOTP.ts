export interface WebOTPResult {
  code?: string;
  error?: string;
}

export function isWebOTPSupported(): boolean {
  return typeof window !== "undefined" && "OTPCredential" in window;
}

export async function requestWebOTP(): Promise<WebOTPResult | null> {
  if (!isWebOTPSupported()) {
    console.log("[WebOTP] API not supported");
    return null;
  }

  try {
    // @ts-ignore - OTPCredential typing is missing in TypeScript lib
    const otp = await navigator.credentials.get({
      otp: { transport: ["sms"] },
      signal: AbortSignal.timeout(5 * 60 * 1000),
    });

    if (otp && "code" in otp) {
      console.log("[WebOTP] Received code:", otp.code);
      return { code: otp.code };
    }

    return null;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("[WebOTP] User cancelled or timeout");
    } else {
      console.error("[WebOTP] Error:", error);
    }
    return { error: error?.message };
  }
}

