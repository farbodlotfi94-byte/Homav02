import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiryTimestamp: number;
  onExpire: () => void;
  format?: "mm:ss" | "seconds";
}

export function CountdownTimer({
  expiryTimestamp,
  onExpire,
  format = "mm:ss",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000)));

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, expiryTimestamp - Date.now());
      const seconds = Math.floor(diff / 1000);
      setTimeLeft(seconds);

      if (diff <= 0) {
        onExpire();
      }
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onExpire]);

  const formatTime = () => {
    if (format === "seconds") {
      return `${timeLeft} ثانیه`;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <span className="font-mono text-sm" dir="ltr">
      {formatTime()}
    </span>
  );
}

