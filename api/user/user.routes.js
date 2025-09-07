import express from "express";
import { userController } from "./user.controller.js";

const router = express.Router();

router.get("/", userController.getUsers);//V
router.get("/:userId", userController.getUserById);//V
router.delete("/:userId", userController.deleteUser);//V
router.post("/", userController.addUser); //X
router.put("/", userController.updateUser); //X

export const userRoutes = router;
