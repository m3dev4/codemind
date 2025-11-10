import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileArchive, Github, Upload } from "lucide-react";
import React from "react";

const Projets = () => {
  return (
    <main className="min-h-screen h-full mx-auto w-full max-w-full overflow-auto">
      <div className="container mx-auto">
        <div className="flex items-start flex-col m-5 px-11">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Projets</h1>
            <p className="text-gray-500">Gestion des projets</p>
          </div>

          <div className="w-full max-w-2xl">
            <Tabs defaultValue="zip" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-stone-900 border border-stone-800">
                <TabsTrigger
                  value="zip"
                  className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
                >
                  <FileArchive className="w-4 h-4 mr-2" />
                  Fichier ZIP
                </TabsTrigger>
                <TabsTrigger
                  value="github"
                  className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </TabsTrigger>
              </TabsList>

              <TabsContent value="zip" className="mt-6">
                <Card className="bg-stone-900 border-stone-800 shadow-2xl">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold text-white">
                      Créer un projet depuis un fichier ZIP
                    </CardTitle>
                    <p className="text-stone-400 text-sm">
                      Importez votre projet en uploadant une archive ZIP
                    </p>
                  </CardHeader>

                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="project-name" className="text-stone-200 font-medium">
                          Nom du projet
                        </Label>
                        <Input
                          id="project-name"
                          placeholder="mon-super-projet"
                          className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-description" className="text-stone-200 font-medium">
                          Description du projet
                        </Label>
                        <Input
                          id="project-description"
                          placeholder="Une description courte de votre projet"
                          className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-file" className="text-stone-200 font-medium">
                          Fichier ZIP
                        </Label>
                        <div className="relative">
                          <Input
                            id="project-file"
                            type="file"
                            accept=".zip"
                            className="bg-stone-800 border-stone-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-stone-700 file:text-stone-200 file:font-medium hover:file:bg-stone-600 file:cursor-pointer cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-stone-500">Formats acceptés : .zip (max 50MB)</p>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <Button
                          type="submit"
                          className="flex-1 bg-white text-stone-900 hover:bg-stone-200 font-medium"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Créer le projet
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-transparent border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="github" className="mt-6">
                <Card className="bg-stone-900 border-stone-800 shadow-2xl">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold text-white">
                      Créer un projet depuis GitHub
                    </CardTitle>
                    <p className="text-stone-400 text-sm">
                      Importez votre projet depuis un repository GitHub
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="text-center py-12 text-stone-500">
                      <form className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="project-name" className="text-stone-200 font-medium">
                            Nom du projet
                          </Label>
                          <Input
                            id="project-name"
                            placeholder="mon-super-projet"
                            className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="project-description"
                            className="text-stone-200 font-medium"
                          >
                            Description du projet
                          </Label>
                          <Input
                            id="project-description"
                            placeholder="Une description courte de votre projet"
                            className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="github-url" className="text-stone-200 font-medium">
                            URL GitHub
                          </Label>
                          <Input
                            id="github-url"
                            placeholder="https://github.com/mon-super-projet"
                            className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="github-branch" className="text-stone-200 font-medium">
                            Branche du repository
                          </Label>
                          <Input
                            id="github-branch"
                            placeholder="main"
                            className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:border-stone-600 focus:ring-stone-600"
                          />
                        </div>
                      </form>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="pt-4 flex gap-3 w-full">
                      <Button
                        type="submit"
                        className="flex-1 bg-white text-stone-900 hover:bg-stone-200 font-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Créer le projet
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Projets;
