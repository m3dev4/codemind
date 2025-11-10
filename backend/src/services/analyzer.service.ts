import type { ProjectManifest, FileAnalysis, FunctionInfo } from "../types/analysis.ts";
import { scannerService } from "./scanner.service.ts";

// Tree-sitter imports optionnels
let Parser: any = null;
let TypeScript: any = null;
let JavaScript: any = null;
let Python: any = null;

try {
  Parser = (await import("tree-sitter")).default;
  TypeScript = (await import("tree-sitter-typescript")).default;
  JavaScript = (await import("tree-sitter-javascript")).default;
  Python = (await import("tree-sitter-python")).default;
} catch (error) {
  console.warn("⚠️ [Analyzer] Tree-sitter not available, using regex fallback");
}

/**
 * Service d'analyse de code avec Tree-sitter (fallback regex si non disponible)
 */
class AnalyzerService {
  private parsers: Map<string, any> = new Map();
  private useTreeSitter = false;

  constructor() {
    this.initializeParsers();
  }

  /**
   * Initialise les parsers Tree-sitter pour chaque langage
   */
  private initializeParsers() {
    if (!Parser) {
      console.log("📝 [Analyzer] Using regex-based analysis");
      return;
    }

    try {
      // TypeScript
      const tsParser = new Parser();
      tsParser.setLanguage(TypeScript.typescript);
      this.parsers.set("typescript", tsParser);

      // JavaScript
      const jsParser = new Parser();
      jsParser.setLanguage(JavaScript);
      this.parsers.set("javascript", jsParser);

      // Python
      const pyParser = new Parser();
      pyParser.setLanguage(Python);
      this.parsers.set("python", pyParser);

      this.useTreeSitter = true;
      console.log("🌳 [Analyzer] Tree-sitter parsers initialized");
    } catch (error) {
      console.warn("⚠️ [Analyzer] Failed to initialize Tree-sitter, using regex fallback");
      this.useTreeSitter = false;
    }
  }

  /**
   * Analyse un projet complet
   */
  async analyzeProject(
    projectId: string,
    storageKey: string,
    manifest: ProjectManifest,
  ): Promise<FileAnalysis[]> {
    const analyses: FileAnalysis[] = [];

    console.log(`🔬 [Analyzer] Analyzing ${manifest.totalFiles} files...`);

    // Filtrer uniquement les fichiers de code analysables
    const codeFiles = manifest.structure.filter(
      (item) => item.type === "file" && this.isAnalyzableFile(item.path),
    );

    let analyzed = 0;
    for (const file of codeFiles) {
      try {
        const content = await scannerService.readFileFromProject(projectId, storageKey, file.path);

        const analysis = await this.analyzeFile(file.path, content);
        analyses.push(analysis);

        analyzed++;
        if (analyzed % 10 === 0) {
          console.log(`📊 [Analyzer] Progress: ${analyzed}/${codeFiles.length} files`);
        }
      } catch (error) {
        console.error(`⚠️ [Analyzer] Failed to analyze ${file.path}:`, error);
      }
    }

    console.log(`✅ [Analyzer] Analysis complete: ${analyses.length} files analyzed`);

    return analyses;
  }

  /**
   * Analyse un fichier individuel
   */
  private async analyzeFile(path: string, content: string): Promise<FileAnalysis> {
    const language = this.detectLanguage(path);
    const parser = language ? this.parsers.get(language) : null;

    if (!parser) {
      // Fallback vers analyse basique par regex
      return this.analyzeFileBasic(path, content, language);
    }

    try {
      const tree = parser.parse(content);
      const rootNode = tree.rootNode;

      const analysis: FileAnalysis = {
        path,
        language: language || "unknown",
        exports: this.extractExportsFromAST(rootNode, language || "unknown"),
        imports: this.extractImportsFromAST(rootNode, language || "unknown"),
        functions: this.extractFunctionsFromAST(rootNode, language || "unknown"),
        classes: this.extractClassesFromAST(rootNode, language || "unknown"),
        linesOfCode: content.split("\n").length,
      };

      return analysis;
    } catch (error) {
      console.warn(`⚠️ [Analyzer] AST parsing failed for ${path}, using regex fallback`);
      return this.analyzeFileBasic(path, content, language);
    }
  }

  /**
   * Analyse basique par regex (fallback)
   */
  private analyzeFileBasic(path: string, content: string, language: string | null): FileAnalysis {
    return {
      path,
      language: language || "unknown",
      exports: this.extractExportsRegex(content, language || "unknown"),
      imports: this.extractImportsRegex(content, language || "unknown"),
      functions: [],
      classes: this.extractClassesRegex(content, language || "unknown"),
      linesOfCode: content.split("\n").length,
    };
  }

  /**
   * Extrait les imports depuis l'AST
   */
  private extractImportsFromAST(node: any, language: string): string[] {
    const imports: string[] = [];

    if (language === "typescript" || language === "javascript") {
      this.traverseAST(node, (n) => {
        if (n.type === "import_statement") {
          const source = n.childForFieldName("source");
          if (source) {
            const importPath = source.text.replace(/['"]/g, "");
            imports.push(importPath);
          }
        }
      });
    } else if (language === "python") {
      this.traverseAST(node, (n) => {
        if (n.type === "import_statement" || n.type === "import_from_statement") {
          const moduleName = n.childForFieldName("name");
          if (moduleName) {
            imports.push(moduleName.text);
          }
        }
      });
    }

    return [...new Set(imports)];
  }

  /**
   * Extrait les exports depuis l'AST
   */
  private extractExportsFromAST(node: any, language: string): string[] {
    const exports: string[] = [];

    if (language === "typescript" || language === "javascript") {
      this.traverseAST(node, (n) => {
        if (n.type === "export_statement") {
          const declaration = n.childForFieldName("declaration");
          if (declaration) {
            const name = this.getDeclarationName(declaration);
            if (name) exports.push(name);
          }
        }
      });
    }

    return [...new Set(exports)];
  }

  /**
   * Extrait les fonctions depuis l'AST
   */
  private extractFunctionsFromAST(node: any, language: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    if (language === "typescript" || language === "javascript") {
      this.traverseAST(node, (n) => {
        if (
          n.type === "function_declaration" ||
          n.type === "method_definition" ||
          n.type === "arrow_function"
        ) {
          const nameNode = n.childForFieldName("name");
          const parametersNode = n.childForFieldName("parameters");

          const name = nameNode?.text || "anonymous";
          const params = this.extractParameters(parametersNode);

          functions.push({
            name,
            params,
            return: "any", // TODO: extraire le type de retour
            lineStart: n.startPosition.row + 1,
            lineEnd: n.endPosition.row + 1,
          });
        }
      });
    }

    return functions;
  }

  /**
   * Extrait les classes depuis l'AST
   */
  private extractClassesFromAST(node: any, language: string): string[] {
    const classes: string[] = [];

    if (language === "typescript" || language === "javascript") {
      this.traverseAST(node, (n) => {
        if (n.type === "class_declaration") {
          const nameNode = n.childForFieldName("name");
          if (nameNode) {
            classes.push(nameNode.text);
          }
        }
      });
    } else if (language === "python") {
      this.traverseAST(node, (n) => {
        if (n.type === "class_definition") {
          const nameNode = n.childForFieldName("name");
          if (nameNode) {
            classes.push(nameNode.text);
          }
        }
      });
    }

    return classes;
  }

  /**
   * Traverse récursivement l'AST
   */
  private traverseAST(node: any, callback: (node: any) => void) {
    callback(node);
    for (const child of node.children) {
      this.traverseAST(child, callback);
    }
  }

  /**
   * Extrait le nom d'une déclaration
   */
  private getDeclarationName(node: any): string | null {
    const nameNode = node.childForFieldName("name");
    return nameNode?.text || null;
  }

  /**
   * Extrait les paramètres d'une fonction
   */
  private extractParameters(parametersNode: any | null): string[] {
    if (!parametersNode) return [];

    const params: string[] = [];
    for (const child of parametersNode.children) {
      if (child.type === "identifier" || child.type === "required_parameter") {
        params.push(child.text);
      }
    }

    return params;
  }

  /**
   * Détecte le langage d'un fichier
   */
  private detectLanguage(filePath: string): string | null {
    const ext = filePath.substring(filePath.lastIndexOf("."));

    const languageMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
    };

    return languageMap[ext] || null;
  }

  /**
   * Vérifie si un fichier peut être analysé
   */
  private isAnalyzableFile(path: string): boolean {
    const analyzableExtensions = [".ts", ".tsx", ".js", ".jsx", ".py"];
    return analyzableExtensions.some((ext) => path.endsWith(ext));
  }

  // ===== Méthodes regex (fallback) =====

  private extractImportsRegex(content: string, language: string | null): string[] {
    const imports: string[] = [];

    if (language === "typescript" || language === "javascript") {
      const importRegex = /import\s+.+\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1] || "");
      }
    }

    return [...new Set(imports)];
  }

  private extractExportsRegex(content: string, language: string | null): string[] {
    const exports: string[] = [];

    if (language === "typescript" || language === "javascript") {
      const exportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1] || "");
      }
    }

    return [...new Set(exports)];
  }

  private extractClassesRegex(content: string, language: string | null): string[] {
    const classes: string[] = [];

    if (language === "typescript" || language === "javascript") {
      const classRegex = /class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1] || "");
      }
    }

    return classes;
  }
}

export const analyzerService = new AnalyzerService();
