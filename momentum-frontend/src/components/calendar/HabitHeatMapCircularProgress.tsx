import { useEffect, useState } from "react";

type HabitHeatMapCircularProgressProps = {
  percentage: number;
  size?: number;
  className?: string;
  animate?: boolean;
  showEmpty?: boolean;
};

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

const getFillOpacity = (value: number) => {
  if (value === 0) return 0;
  if (value <= 25) return 0.25;
  if (value <= 50) return 0.45;
  if (value <= 75) return 0.65;
  if (value < 100) return 0.85;
  return 1;
};

const getWedgePath = (radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  const x = radius - radius * Math.sin(radians);
  const y = radius - radius * Math.cos(radians);
  const largeArcFlag = angle > 180 ? 1 : 0;
  return `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x} ${y} Z`;
};

const HabitHeatMapCircularProgress = ({
  percentage,
  size = 16,
  className = "",
  animate = true,
  showEmpty = false,
}: HabitHeatMapCircularProgressProps) => {
  const clamped = clampPercentage(percentage);
  const [isAnimated, setIsAnimated] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const frame = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const radius = size / 2;
  const displayPercentage = animate && !isAnimated ? 0 : clamped;
  const fillOpacity = getFillOpacity(clamped);

  if (clamped === 0 && !showEmpty) return null;

  if (clamped === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="var(--border)"
          stroke="var(--border)"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`${clamped}% complete`}
      role="img"
    >
      {displayPercentage >= 100 ? (
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="var(--ring)"
          fillOpacity={fillOpacity}
          style={{ transition: "fill-opacity 650ms ease-out" }}
        />
      ) : (
        <path
          d={getWedgePath(radius, (displayPercentage / 100) * 360)}
          fill="var(--ring)"
          fillOpacity={fillOpacity}
          style={{ transition: "d 650ms ease-out, fill-opacity 650ms ease-out" }}
        />
      )}
    </svg>
  );
};

export default HabitHeatMapCircularProgress;
