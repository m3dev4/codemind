import { Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { LanguageIcon } from "./LanguageIcon";
import { Item } from "@radix-ui/react-dropdown-menu";

export default function chartLanguages({ languages }: { languages: Record<string, number> }) {
  const data = Object.entries(languages || {}).map(([key, value]) => ({
    name: key,
    value: value,
    percentage: 0,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach((item) => {
    item.percentage = ((item.value / total) * 100).toFixed(1) as unknown as number;
  });
  data.sort((a, b) => b.value - a.value);

  return (
    <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-sora text-white">
          <Code2 className="w-5 h-5 text-blue-400" />
          Langages utilisés
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        LanguageIcon({ language: entry.name, size: 0, showColor: true }).props.style
                          .color
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} fichiers (${props.payload.percentage}%)`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-4">
              {data.map((entry, index) => (
                <div className="flex justify-between items-start text-xs" key={index}>
                  <div className="flex items-center gap-2">
                    <LanguageIcon language={entry.name} size={16} />
                    <span className="font-sora text-stone-300">{entry.name}</span>
                  </div>
                  <div>
                    <span className="font-sora text-white font-medium">{entry.value} fichiers</span>
                    <span className="ml-2 text-stone-500">({entry.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-red-400">Aucun langage détecté pour ce projet.</div>
        )}
      </CardContent>
    </Card>
  );
}
