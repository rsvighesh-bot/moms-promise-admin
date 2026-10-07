import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating: number; // supports half-star fractions, e.g. 3.5
  size?: number;
  className?: string;
}

// Read-only star rating — renders 5 stars, each fractionally filled via a
// clipped overlay so half-star values (3.5, 4.5, ...) render correctly,
// not just rounded to the nearest whole star.
export function StarRatingDisplay({
  rating,
  size = 16,
  className = "",
}: StarRatingDisplayProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fillPercent = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <span
            key={i}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="absolute inset-0 text-border" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star size={size} className="text-accent fill-accent" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
