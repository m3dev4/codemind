import { FileType2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LanguageIcon } from "./LanguageIcon";

export const FileDistribution = ({ structure } : { structure: any[] }) => {
  const extensionsCount = {} as Record<string, number>;

  if (Array.isArray(structure)) {
    structure.forEach((item) => {
      if (item.type === "file" && item.extension) {
        const ext = item.extension.toLowerCase();
        extensionsCount[ext] = (extensionsCount[ext] || 0) + 1;
      }
    });
  }

  const data = Object.entries(extensionsCount)
    .map(([ext, count]) => ({
      name: ext.replace(".", "").toUpperCase() || "Autres",
      count: count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 extensions

  return (
    <>
      <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-sora text-white">
            <FileType2 className="w-5 h-5 text-purple-600" />
            Répartition des fichiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          LanguageIcon({ language: entry.name, size: 0, showColor: true }).props
                            .style.color
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              <div className="text-center py-8 text-red-400">
                Aucun langage détecté pour ce projet.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
