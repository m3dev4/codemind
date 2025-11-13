import { Activity, Target, TrendingUp, Zap } from "lucide-react";

export const metrics = [
    {
        label: "Ligne de code moyennes",
        value: "",
        max: 500,
        icon: Activity,
        color: "blue",
        description: "Par fichier"
    },
    {
        label: "Complexité moyenne",
        value: "",
        max: 500,
        icon: Zap,
        color: "purple",
        description: "Score de complexité"
    },
    {
        label: "Taux d'exports",
        value: "",
        max: 500,
        icon: TrendingUp,
        color: "green",
        description: `${""} fichiers`
    },
    {
        label: "Taux d'imports",
        value: "",
        max: 500,
        icon: Target,
        color: "orange",
        description: `${""} fichiers`
    },
]