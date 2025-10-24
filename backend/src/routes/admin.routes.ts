import { Router } from "express";
import * as adminController from "../controllers/admin.controller.ts";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.ts";

const router: Router = Router();

/*
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs
 * @access  Admin
 */
router.get("/users", isAuthenticated, isAdmin, adminController.getAllUsers);

/*
 * @route   GET /api/admin/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Admin
 */
router.get("/users/:id", isAuthenticated, isAdmin, adminController.getUserById);

/*
 * @route   PUT /api/admin/users/:id
 * @desc    Mettre à jour un utilisateur par ID
 * @access  Admin
 */
router.put("/users/:id", isAuthenticated, isAdmin, adminController.updateUserById);

/*
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur par ID
 * @access  Admin
 */
router.delete("/users/:id", isAuthenticated, isAdmin, adminController.deleteUserById);

export default router;
