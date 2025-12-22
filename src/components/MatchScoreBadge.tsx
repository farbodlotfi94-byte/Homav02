/**
 * MatchScoreBadge Component
 *
 * Displays a match score percentage badge for product recommendations.
 * Color-coded based on score: green (high), yellow (medium), gray (low).
 */

interface MatchScoreBadgeProps {
  score: number; // 0-100 percentage
  size?: "sm" | "md" | "lg";
}

export function MatchScoreBadge({ score, size = "sm" }: MatchScoreBadgeProps) {
  // Clamp score between 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine color based on score
  const getColors = () => {
    if (clampedScore >= 80) {
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        ring: "ring-green-200",
      };
    } else if (clampedScore >= 60) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        ring: "ring-yellow-200",
      };
    } else if (clampedScore >= 40) {
      return {
        bg: "bg-orange-100",
        text: "text-orange-700",
        ring: "ring-orange-200",
      };
    } else {
      return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        ring: "ring-gray-200",
      };
    }
  };

  const colors = getColors();

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`
        inline-flex items-center
        font-semibold
        rounded-full
        ring-1
        ${colors.bg}
        ${colors.text}
        ${colors.ring}
        ${sizeClasses[size]}
      `}
      dir="ltr"
    >
      {clampedScore}%
    </span>
  );
}
