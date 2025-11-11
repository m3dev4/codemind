"use client";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/projects/useProject";
import { AlertCircle, ChevronRight, FileArchive, FolderGit2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading, error } = useProject(projectId);

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
          <div className="flex items-start justify-between mb-6  fixed z-20">
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
            </div>
            <div>
              
              
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectDetailPage;
