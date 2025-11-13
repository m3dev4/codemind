"use client";
import ChartLanguages from "@/components/projects/chartLanguages";
import { CodeMetric } from "@/components/projects/codeMetric";
import { FileDistribution } from "@/components/projects/fileDistribution";
import StatusBadge from "@/components/projects/statusBadge";
import { TopFiles } from "@/components/projects/topFiles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/projects/useProject";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Code2,
  Download,
  FileArchive,
  FileCode2,
  FolderGit2,
  GitBranch,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading, error } = useProject(projectId);

  const totalFiles = project?.fileAnalyses?.length || 0;

  const totalLineOfCode =
    project?.fileAnalyses?.reduce((acc: number, file: any) => acc + file.linesOfCode, 0) || 0;

  const avgComplexity =
    totalFiles > 0
      ? Math.round(
          (project?.fileAnalyses?.reduce(
            (acc: number, file: any) => acc + (file.complexity || 0),
            0,
          ) || 0) / totalFiles,
        )
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen h-full w-full max-w-full  mx-auto overflow-auto">
        <div className="container mx-auto p-8">
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin h-5 w-5" />
            <p className="text-stone-400 font-sora font-medium">Chargement du projet...📁</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    <div className="min-h-screen mx-auto w-full h-full max-w-full overflow-auto">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center border border-red-500/20">
          <AlertCircle className="w-12 h-1/2 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-sora font-semibold mb-2">Projet introuvable</p>
          <p className="text-stone-400 font-inter mb-6">
            {error?.message || "Une erreur est survenue lors du chargement du projet."}
          </p>
          <Link href="/projets/lists">
            <Button>Retour à la liste</Button>
          </Link>
        </div>
      </div>
    </div>;
  }

  return (
    <main className="min-h-screen h-full mx-auto w-full max-w-full overflow-auto">
      <div className="container mx-auto px-8 py-12 flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-start w-full justify-between mb-6 ">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-8">
                  <Link
                    href="/projets/lists"
                    className="text-stone-400 hover:text-stone-200 transition"
                  >
                    <span className="text-sm font-inter">Projets</span>
                  </Link>
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                  <span className="text-sm font-inter text-stone-300">{project?.name}</span>
                </div>
              </div>

              <div className="px-6">
                <div className="flex gap-3">
                  <Button className="border-stone-700/50 hover:border-stone-600/50 bg-stone-800/30 hover:bg-stone-800/50 text-white font-sora font-medium backdrop-blur-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-sora font-semibold shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyse IA
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div
              className={`p-3 rounded-xl ${
                project?.sourceType === "GITHUB"
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {project?.sourceType === "GITHUB" ? (
                <FolderGit2 className="w-6 h-6" />
              ) : (
                <FileArchive className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold font-sora bg-gradient-to-r from-white via-stone-200 to-stone-400 bg-clip-text text-transparent">
                {project?.name}
              </h1>
              {project?.description && (
                <p className="text-stone-400 font-inter text-lg mt-1">{project?.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={project?.status} />
            {project?.githubUrl && (
              <Badge
                className="bg-stone-800/30 border-stone-700/30 text-stone-300 font-inter"
              >
                <GitBranch className="w-3 h-3 mr-1" />
                {project?.githubBranch || "main"}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-stone-400 text-sm font-sora font-medium uppercase tracking-wider">
                  Fichiers
                </p>
                <FileCode2 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold font-sora text-white">{totalFiles}</p>
              <p className="text-stone-500 text-xs font-inter mt-1">Fichiers analysés</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-stone-400 text-sm font-sora font-medium uppercase tracking-wider">
                  Lignes de code
                </p>
                <Code2 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold font-sora text-white">
                {totalLineOfCode.toLocaleString()}
              </p>
              <p className="text-stone-500 text-xs font-inter mt-1">LOC au total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-stone-400 text-sm font-sora font-medium uppercase tracking-wider">
                  Complexité
                </p>
                <FileCode2 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold font-sora text-white">{avgComplexity}</p>
              <p className="text-stone-500 text-xs font-inter mt-1">moyenne</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-stone-400 text-sm font-sora font-medium uppercase tracking-wider">
                  Tailles
                </p>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold font-sora text-white">{totalFiles}</p>
              <p className="text-stone-500 text-xs font-inter mt-1">
                {project?.fileSize ? (parseInt(project?.fileSize) / 1024 / 1024).toFixed(1) : "0"}
                <span className="text-stone-500 text-xs font-inter mt-1">MB</span>
              </p>
              <p>
                créé{" "}
                {formatDistanceToNow(new Date(project?.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Illustrer les sur un diagramme */}
        <div className="grid grid-cols-5 grid-rows-5 gap-4 flex-1">
          <div className=" col-span-2 row-span-5">
            <ChartLanguages languages={project?.languages || []} />
          </div>
          <div className="col-span-2 row-span-5 col-start-4">
            <FileDistribution structure={project?.manifest?.structure || []} />
          </div>
        </div>

        {/* Les métriques &  */}
       <div className="mt-8">
         <div className="grid grid-cols-5 grid-rows-5 gap-4 flex-1">
          <div className="col-span-2 row-span-5">
            <CodeMetric />
          </div>
          <div className="col-span-2 row-span-5 col-start-4">
            <TopFiles />
          </div>
        </div>
       </div>
      </div>
    </main>
  );
};

export default ProjectDetailPage;
