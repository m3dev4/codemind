import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity } from "lucide-react";
import { metrics } from "@/constants/metrics";

const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", progress: "bg-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", progress: "bg-purple-600" },
    green: { bg: "bg-green-50", text: "text-green-600", progress: "bg-green-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", progress: "bg-orange-600" },
  };

export const CodeMetric = ({ fileAnalyses }: { fileAnalyses: any[] }) => {
  const totalLines = fileAnalyses.reduce((sum, fa) => sum + (fa.linesOfCode || 0), 0);
  const avgLines = fileAnalyses.length > 0 ? Math.round(totalLines / fileAnalyses.length) : 0;

  const complexityData = fileAnalyses.filter((fa) => fa.complexity);
  const avgComplexity =
    complexityData.length > 0
      ? Math.round(
          complexityData.reduce((sum, fa) => sum + fa.complexity, 0) / complexityData.length,
        )
      : 0;

  const filesWithExports = fileAnalyses.filter((fa) => fa.exports && fa.exports.length > 0);
  const exportRate =
    fileAnalyses.length > 0 ? Math.round(filesWithExports.length / fileAnalyses.length) * 100 : 0;

  const filesWithImports = fileAnalyses.filter((fa) => fa.imports && fa.imports.length > 0).length;
  const importRate =
    fileAnalyses.length > 0 ? Math.round((filesWithImports / fileAnalyses.length) * 100) : 0;

  return (
    <>
      <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-4 text-stone-300 font-sora text-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            Métriques de code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {metrics.map((m, index) => {
                const value = m.label === "Ligne de code moyennes" ? avgLines : 
                m.label === "Complexité moyenne" ? avgComplexity : 
                m.label === "Exportation" ? exportRate : 
                m.label === "Importation" ? importRate : 
                0
            })}
        </CardContent>
      </Card>
    </>
  );
};
