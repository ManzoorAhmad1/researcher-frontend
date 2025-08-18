import React from "react";

const MainProgressBar = ({ value = 0 }: { value: number }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - value / 100);

  return (
    <svg width="200" height="200">
      <g transform="rotate(-90 100 100)">
        <circle
          r={radius}
          cx="100"
          cy="100"
          fill="transparent"
          stroke="#D9D9D9"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset="0"
        />
        <circle
          r={radius}
          cx="100"
          cy="100"
          fill="transparent"
          stroke="#28a745"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </g>
      <text
        x="50%"
        y="45%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        className="dark:fill-[#CCCCCC]"
      >
        {value}%
      </text>
      <text
        x="50%"
        y="55%"
        dominantBaseline="central"
        fill="#666666"
        textAnchor="middle"
        fontSize="14"
        className="dark:fill-[#CCCCCC]"
      >
        Progress
      </text>
    </svg>
  );
};

export default MainProgressBar;
