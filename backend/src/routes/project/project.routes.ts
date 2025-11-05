import express, { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.ts";
import { uploadMiddleware } from "../../middlewares/upload.middleware.ts";
import { projectController } from "../../controllers/project.controller.ts";

const router: Router = express.Router();

console.log("Project routes loading...");

router.get("/test", (req, res) => {
  console.log("Project routes test...");
  res.json({
    success: true,
    message: "Test successful",
  });
});

router.use(isAuthenticated);

router.post(
  "/upload",
  uploadMiddleware.single("file"),
  projectController.createFromZip.bind(projectController),
);

router.post("/github", projectController.createFromGithub.bind(projectController));

router.get("/", projectController.getuserProjects.bind(projectController));

router.get("/:id", projectController.getProjectById.bind(projectController));

router.delete("/:id", projectController.deleteProject.bind(projectController));

export default router;
