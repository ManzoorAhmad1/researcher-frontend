import { PdfQualityData } from "@/types/types";
import React, { useEffect, useState } from "react";

import RadarChart from "./RadarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PaperEvaluationProps {
  data: PdfQualityData;
  citation: number;
}

const PaperEvaluation: React.FC<PaperEvaluationProps> = ({
  data,
  citation,
}) => {
  const [expandedSections, setExpandedSections] = useState<any>({
    summary: true,
  });
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    if (data && Object?.values(data) && Object?.values(data).length > 0) {
      const confidenceScores = Object.entries(data)
        .filter(([key]) => key !== "summary")
        .map(([key, value]) => value?.confidence_score);
      const totalScore = confidenceScores.reduce(
        (sum, score) => sum + score,
        0
      );
      const averageScore = totalScore / confidenceScores.length;
      setAverageScore(averageScore);
    }
  }, [data]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section as any],
    }));
  };

  const handleBorderColor = (score: any, isBorder?: boolean) => {
    if (score <= 3) {
      return isBorder ? "border-red-500" : "red-500";
    } else if (score >= 4 && score <= 6) {
      return isBorder ? "border-yellow-500" : "yellow-500";
    } else {
      return isBorder ? "border-green-500" : "green-500";
    }
  };
  if (!data || data === null) {
    return (
      <div className="pt-10 flex justify-center items-center h-full">
        The Paper has not been processed.
      </div>
    );
  }
  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-center gap-6 pt-10 items-center flex-wrap">
        <RadarChart data={data} />

        <div className="p-6">
          <CardTitle className="text-center pb-4 ">
            Average Confidence Score{" "}
          </CardTitle>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div
                className={`text-5xl font-bold text-${handleBorderColor(
                  averageScore
                )}`}
              >
                {averageScore.toFixed(1)}
              </div>
            </div>
            <div className="flex gap-1 justify-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i < averageScore
                      ? `bg-${handleBorderColor(averageScore)}`
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="text-center mt-4 text-gray-600">
              Based on {Object?.values(data).length - 1} metrics
            </div>
          </CardContent>
        </div>
      </div>

      {Object.entries(data)?.map(([key, val]) => {
        return (
          <Card key={key} className={`mb-4 ${key !== "summary" && "order-1"}`}>
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between"
              onClick={() => toggleSection(key)}
            >
              <CardTitle className="text-lg">
                {key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
                {key !== "summary" && (
                  <span className="ml-2 text-sm text-blue-600">
                    (Confidence: {val?.confidence_score}/10)
                  </span>
                )}
              </CardTitle>
              {expandedSections[key] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </CardHeader>
            {expandedSections[key] && (
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(val).map(([labelKey, value]) => {
                    if (labelKey !== "confidence_score") {
                      return (
                        <div
                          key={labelKey}
                          className={`border-l-2 ${handleBorderColor(
                            key === "summary"
                              ? averageScore
                              : val.confidence_score,
                            true
                          )} pl-4`}
                        >
                          <h4 className="font-medium">
                            {labelKey
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </h4>
                          <p className="text-gray-600">
                            {labelKey === "citation_count"
                              ? citation
                              : (value as string)}{" "}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default PaperEvaluation;
