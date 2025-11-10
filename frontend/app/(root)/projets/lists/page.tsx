"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects, useDeleteProject, useJobStatus } from "@/hooks/projects/useProject";
import { Project, ProjectStatus } from "@/types/projects/project.type";
import {
  Loader2,
  Trash2,
  FolderGit2,
  FileArchive,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { LanguageIcon } from "@/components/projects/LanguageIcon";

// Badge de statut avec design moderne
const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const statusConfig = {
    PENDING: {
      label: "En attente",
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      icon: Clock,
    },
    UPLOADING: {
      label: "Upload",
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      icon: Loader2,
    },
    UPLOADED: {
      label: "Uploadé",
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      icon: CheckCircle2,
    },
    ANALYZING: {
      label: "Analyse",
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      icon: Loader2,
    },
    READY: {
      label: "Prêt",
      gradient: "from-emerald-500 to-green-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      icon: CheckCircle2,
    },
    FAILED: {
      label: "Échoué",
      gradient: "from-red-500 to-rose-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.bg} ${config.border} ${config.text} border backdrop-blur-sm font-sora font-medium gap-1.5 px-3 py-1`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

// Composant pour afficher un projet avec design premium
const ProjectCard = ({ project }: { project: Project }) => {
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    if (window.confirm(`Voulez-vous vraiment supprimer "${project.name}" ?`)) {
      deleteProject.mutate(project.id);
    }
  };

  return (
    <Card className="group relative bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 hover:border-stone-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 overflow-hidden">
      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                project.sourceType === "GITHUB"
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {project.sourceType === "GITHUB" ? (
                <FolderGit2 className="w-5 h-5" />
              ) : (
                <FileArchive className="w-5 h-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-sora font-semibold text-white mb-1">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="text-stone-400 text-sm font-inter line-clamp-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-4">
          {/* Informations du projet avec meilleur design */}
          <div className="grid grid-cols-2 gap-4">
            {project.githubUrl && (
              <div className="col-span-2 p-3 rounded-lg bg-stone-800/30 border border-stone-700/30">
                <p className="text-stone-400 text-xs font-sora font-medium uppercase tracking-wider mb-1.5">
                  Repository
                </p>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1.5 group/link transition-colors"
                >
                  <span className="truncate">
                    {project.githubUrl.split("/").slice(-2).join("/")}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>
            )}
            {project.fileSize && (
              <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/30">
                <p className="text-stone-400 text-xs font-sora font-medium uppercase tracking-wider mb-1.5">
                  Taille
                </p>
                <p className="text-white font-semibold font-sora text-lg">
                  {(parseInt(project.fileSize) / 1024 / 1024).toFixed(2)}
                  <span className="text-stone-500 text-sm font-normal ml-1">MB</span>
                </p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/30">
              <p className="text-stone-400 text-xs font-sora font-medium uppercase tracking-wider mb-1.5">
                Créé
              </p>
              <p className="text-white font-medium font-inter text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </div>
          </div>

          {/* Langages détectés avec design amélioré */}
          {project.languages && Object.keys(project.languages).length > 0 && (
            <div>
              <p className="text-stone-400 text-xs font-sora font-medium uppercase tracking-wider mb-3">
                Langages détectés
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(project.languages)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 6)
                  .map(([lang, count]) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="bg-gradient-to-br from-stone-800/50 to-stone-900/50 border-stone-700/50 text-stone-200 gap-2 px-3 py-1.5 font-inter backdrop-blur-sm hover:border-stone-600/50 transition-colors"
                    >
                      <LanguageIcon language={lang} size={16} />
                      <span className="capitalize font-medium">{lang}</span>
                      <span className="text-stone-500">·</span>
                      <span className="font-semibold text-stone-300">{count}</span>
                    </Badge>
                  ))}
                {Object.keys(project.languages).length > 6 && (
                  <Badge
                    variant="outline"
                    className="bg-stone-800/30 border-stone-700/30 text-stone-400 px-3 py-1.5 font-inter"
                  >
                    +{Object.keys(project.languages).length - 6}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions avec design moderne */}
          <div className="flex gap-2.5 pt-2">
            <Link href={`/projets/${project.id}`} className="flex-1">
              <Button className="w-full border-stone-700/50 hover:border-stone-600/50 bg-stone-800/30 hover:bg-stone-800/50 text-white font-sora font-medium backdrop-blur-sm transition-all duration-200">
                Voir les détails
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              className="border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            >
              {deleteProject.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Page principale avec design ultra-professionnel
export default function ListeProjets() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <main className="min-h-screen h-full mx-auto w-full max-w-full overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black">
        <div className="container mx-auto p-8">
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-stone-700 border-t-white rounded-full animate-spin" />
            </div>
            <p className="text-stone-400 font-sora font-medium">Chargement des projets...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen h-full mx-auto w-full max-w-full overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black">
        <div className="container mx-auto p-8">
          <div className="flex flex-col items-center justify-center h-96 gap-6">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-sora font-semibold mb-2">
                Erreur lors du chargement
              </p>
              <p className="text-stone-400 font-inter">{error.message}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen h-full mx-auto w-full max-w-full overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black">
      <div className="container mx-auto px-8 py-12">
        {/* Header avec design premium */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold font-sora bg-gradient-to-r from-white via-stone-200 to-stone-400 bg-clip-text text-transparent mb-3">
                Mes Projets
              </h1>
              <p className="text-stone-400 font-inter text-lg">
                <span className="text-white font-semibold">{projects?.length || 0}</span> projet
                {projects?.length !== 1 ? "s" : ""} au total
              </p>
            </div>
            <Link href="/projets">
              <Button className="bg-gradient-to-r from-white to-stone-200 text-stone-900 hover:from-black hover:to-stone-900 hover:text-white font-sora font-semibold shadow-lg shadow-white/10 hover:shadow-black/20 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau projet
              </Button>
            </Link>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
        </div>

        {/* Liste des projets avec grid amélioré */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-stone-900/50 to-stone-950/50 border-stone-800/50 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="mb-6 p-6 rounded-2xl bg-stone-800/30 border border-stone-700/30 inline-block">
                  <FolderGit2 className="w-16 h-16 text-stone-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold font-sora text-white mb-3">
                  Aucun projet pour le moment
                </h3>
                <p className="text-stone-400 font-inter mb-8 text-lg">
                  Commencez par créer votre premier projet pour analyser votre code
                </p>
                <Link href="/projets">
                  <Button className="bg-gradient-to-r from-white to-stone-200 text-stone-900 hover:from-black hover:to-stone-900 hover:text-white font-sora font-semibold text-lg px-8 py-6 shadow-xl shadow-white/10 hover:shadow-black/20 transition-all duration-200">
                    <Plus className="w-5 h-5 mr-2" />
                    Créer mon premier projet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
