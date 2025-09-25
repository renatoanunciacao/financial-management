import React from "react";

export function LoadingBubbles() {
   const bubbles = Array(8).fill(0);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="relative w-16 h-16 animate-spin">
        {bubbles.map((_, i) => {
          const angle = (360 / bubbles.length) * i;
          const delay = `${i * 0.1}s`;

          return (
            <div
              key={i}
              style={{
                transform: `rotate(${angle}deg) translate(24px) rotate(-${angle}deg)`,
                animationDelay: delay,
              }}
              className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-600 rounded-full origin-center animate-pulse"
            />
          );
        })}
      </div>
    </div>
  );
}
