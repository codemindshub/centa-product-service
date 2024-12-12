import express from "express";
import { sayHi } from "../controllers/sayHi.js";
import { authMiddleware } from "../middleware/auth.js";
export const router = express.Router()

router.get('/', sayHi);
