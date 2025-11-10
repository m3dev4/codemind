import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiOpenjdk,
  SiCplusplus,
  SiC,
  SiRust,
  SiGo,
  SiPhp,
  SiRuby,
  SiSwift,
  SiKotlin,
  SiDart,
  SiSharp,
  SiHtml5,
  SiCss3,
  SiSass,
  SiMarkdown,
  SiJson,
  SiYaml,
  SiGnubash,
  SiReact,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiNodedotjs,
  SiDocker,
  SiGraphql,
  SiSolidity,
  SiElixir,
  SiPerl,
  SiScala,
  SiLua,
  SiR,
  SiHaskell,
  SiClojure,
} from "react-icons/si";
import { IconType } from "react-icons";
import { FileCode } from "lucide-react";

// Mapping des langages vers leurs icônes avec couleurs officielles
const languageIcons: Record<string, { icon: IconType; color: string }> = {
  javascript: { icon: SiJavascript, color: "#F7DF1E" },
  typescript: { icon: SiTypescript, color: "#3178C6" },
  python: { icon: SiPython, color: "#3776AB" },
  java: { icon: SiOpenjdk, color: "#007396" },
  "c++": { icon: SiCplusplus, color: "#00599C" },
  cpp: { icon: SiCplusplus, color: "#00599C" },
  c: { icon: SiC, color: "#A8B9CC" },
  rust: { icon: SiRust, color: "#000000" },
  go: { icon: SiGo, color: "#00ADD8" },
  golang: { icon: SiGo, color: "#00ADD8" },
  php: { icon: SiPhp, color: "#777BB4" },
  ruby: { icon: SiRuby, color: "#CC342D" },
  swift: { icon: SiSwift, color: "#FA7343" },
  kotlin: { icon: SiKotlin, color: "#7F52FF" },
  dart: { icon: SiDart, color: "#0175C2" },
  "c#": { icon: SiSharp, color: "#239120" },
  csharp: { icon: SiSharp, color: "#239120" },
  html: { icon: SiHtml5, color: "#E34F26" },
  css: { icon: SiCss3, color: "#1572B6" },
  scss: { icon: SiSass, color: "#CC6699" },
  sass: { icon: SiSass, color: "#CC6699" },
  markdown: { icon: SiMarkdown, color: "#000000" },
  md: { icon: SiMarkdown, color: "#000000" },
  json: { icon: SiJson, color: "#000000" },
  yaml: { icon: SiYaml, color: "#CB171E" },
  yml: { icon: SiYaml, color: "#CB171E" },
  shell: { icon: SiGnubash, color: "#4EAA25" },
  bash: { icon: SiGnubash, color: "#4EAA25" },
  sh: { icon: SiGnubash, color: "#4EAA25" },
  react: { icon: SiReact, color: "#61DAFB" },
  vue: { icon: SiVuedotjs, color: "#4FC08D" },
  angular: { icon: SiAngular, color: "#DD0031" },
  svelte: { icon: SiSvelte, color: "#FF3E00" },
  nodejs: { icon: SiNodedotjs, color: "#339933" },
  node: { icon: SiNodedotjs, color: "#339933" },
  docker: { icon: SiDocker, color: "#2496ED" },
  graphql: { icon: SiGraphql, color: "#E10098" },
  solidity: { icon: SiSolidity, color: "#363636" },
  sol: { icon: SiSolidity, color: "#363636" },
  elixir: { icon: SiElixir, color: "#4B275F" },
  perl: { icon: SiPerl, color: "#39457E" },
  scala: { icon: SiScala, color: "#DC322F" },
  lua: { icon: SiLua, color: "#2C2D72" },
  r: { icon: SiR, color: "#276DC3" },
  haskell: { icon: SiHaskell, color: "#5D4F85" },
  clojure: { icon: SiClojure, color: "#5881D8" },
};

interface LanguageIconProps {
  language: string;
  size?: number;
  className?: string;
  showColor?: boolean;
}

export const LanguageIcon = ({
  language,
  size = 16,
  className = "",
  showColor = true,
}: LanguageIconProps) => {
  const normalizedLang = language.toLowerCase().trim();
  const langConfig = languageIcons[normalizedLang];

  if (!langConfig) {
    // Fallback: icône générique de code
    return (
      <FileCode
        size={size}
        className={className}
        style={showColor ? { color: "#6B7280" } : undefined}
      />
    );
  }

  const Icon = langConfig.icon;

  return (
    <Icon
      size={size}
      className={className}
      style={showColor ? { color: langConfig.color } : undefined}
    />
  );
};
