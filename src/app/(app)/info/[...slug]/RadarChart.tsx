import { PdfQualityData } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { LineRadial, Line } from "@visx/shape";
import { Point } from "@visx/point";

interface PaperEvaluationProps {
  data: PdfQualityData;
}

type ChartDataItem = {
  category: string;
  score: number;
};

const RadarChart: React.FC<PaperEvaluationProps> = ({ data }) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    const formattedData: ChartDataItem[] = Object.entries(data)
      .filter(([key]) => key !== "summary")
      .map(([key, value]) => ({
        category: key,
        score: value?.confidence_score ?? 0,
      }));
    setChartData(formattedData);
  }, [data]);

  const width = 600;
  const height = 600;
  const centerY = height / 2;
  const maxScore = 10;
  const angleStep = (2 * Math.PI) / chartData.length;

  const radiusScale = scaleLinear({
    domain: [0, maxScore],
    range: [0, centerY - 40],
  });

  const margin = { top: 40, left: 80, right: 80, bottom: 80 };
  const genAngles = (length: number) =>
    [...new Array(length + 1)].map((_, i) => ({
      angle: i * (360 / length) + (length % 2 === 0 ? 0 : 360 / length / 2),
    }));
  const webs = genAngles(chartData.length);
  const radialScale = scaleLinear<number>({
    range: [0, Math.PI * 2],
    domain: [360, 0],
  });

  const y = (d: any) => d.score;
  const genPoints = (length: number, radius: number) => {
    const step = (Math.PI * 2) / length;
    return [...new Array(length)].map((_, i) => ({
      x: radius * Math.sin(i * step),
      y: radius * Math.cos(i * step),
    }));
  };

  function genPolygonPoints<Datum>(
    dataArray: Datum[],
    scale: (n: number) => number,
    getValue: (d: Datum) => number
  ) {
    const step = (Math.PI * 2) / dataArray.length;
    const points: { x: number; y: number }[] = [];

    const pointString = dataArray
      .map((d, i) => {
        const radius = scale(getValue(d));
        const xVal = radius * Math.sin(i * step);
        const yVal = radius * Math.cos(i * step);
        points.push({ x: xVal, y: yVal });
        return `${xVal},${yVal}`;
      })
      .join(" ");

    return { points, pointString };
  }

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radius = Math.min(xMax, yMax) / 2;

  const yScale = scaleLinear<number>({
    range: [0, radius],
    domain: [0, maxScore],
  });

  const zeroPoint = new Point({ x: 0, y: 0 });
  const points = genPoints(chartData.length, radius);
  const polygonPoints = genPolygonPoints(chartData, (d) => yScale(d) ?? 0, y);

  const intervals = [0, 2, 5, maxScore];
  return (
    <div>
      <svg width={width} height={height}>
        <Group top={height / 2 - margin.top} left={width / 2}>
          {[...new Array(5)].map((_, i) => (
            <LineRadial
              key={`web-${i}`}
              data={webs}
              angle={(d: any) => radialScale(d.angle) ?? 0}
              radius={((i + 1) * radius) / 5}
              fill="none"
              stroke={"#d9d9d9"}
              strokeWidth={2}
              strokeOpacity={0.8}
              strokeLinecap="round"
            />
          ))}
          {[...new Array(chartData.length)].map((_, i) => (
            <Line
              key={`radar-line-${i}`}
              from={zeroPoint}
              to={points[i]}
              stroke={"#d9d9d9"}
            />
          ))}
          <polygon
            points={polygonPoints.pointString}
            fill={"#ff9933"}
            fillOpacity={0.3}
            stroke={"#ff9933"}
            strokeWidth={1}
          />
          {polygonPoints.points.map((point, i) => (
            <circle
              key={`radar-point-${i}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={"#f5810c"}
            />
          ))}

          {chartData.map((item, i) => {
            const angle = i * angleStep;
            const x = Math.sin(angle);
            const y = Math.cos(angle);

            return (
              <g key={`labels-${i}`}>
                {i === 0 &&
                  intervals.map((interval) => (
                    <text
                      key={`interval-${interval}`}
                      x={x * radiusScale(interval)}
                      y={
                        interval !== 10
                          ? y * radiusScale(interval)
                          : y * radiusScale(interval) - 30
                      }
                      fontSize={12}
                      fill="#6f6e6c"
                      textAnchor="middle"
                      dy=".35em"
                      className="dark:fill-[#CCCCCC]"
                    >
                      {interval}
                    </text>
                  ))}
                <text
                  x={x * (radius + 35)}
                  y={y * (radius + 25)}
                  fontSize={10}
                  fontWeight="bold"
                  fill="#333"
                  textAnchor="middle"
                  className="dark:fill-[#CCCCCC]"
                >
                  {item.category.replace(/_/g, " ")}
                </text>
              </g>
            );
          })}
        </Group>
      </svg>
    </div>
  );
};

export default RadarChart;
