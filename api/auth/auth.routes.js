import express from 'express'
import {authController} from './auth.controller.js'

const router = express.Router()

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);

export const authRoutes = router;