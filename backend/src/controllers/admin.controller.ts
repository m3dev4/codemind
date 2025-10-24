import asyncHandlerMiddleware from "../middlewares/asyncHandlerMiddleware.ts";
import * as authService from "../services/auth.service.ts";
import type { Request, Response } from "express";

const getAllUsers = asyncHandlerMiddleware(async (req: Request, res: Response) => {
  const users = await authService.getAllUsers();
  res.status(200).json(users);
});

const getUserById = asyncHandlerMiddleware(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.params.id as string);
  res.status(200).json(user);
});

const updateUserById = asyncHandlerMiddleware(async (req: Request, res: Response) => {
  const user = await authService.updateUserById(req.params.id as string, req.body);
  res.status(200).json(user);
});

const deleteUserById = asyncHandlerMiddleware(async (req: Request, res: Response) => {
  const user = await authService.deleteUserById(req.params.id as string);
  res.status(200).json(user);
});

export { getAllUsers, getUserById, updateUserById, deleteUserById };
