import express from "express";
import { loggerMiddleware } from "./middleware/loggingMiddleware.js";

const app = express();
app.use(express.json());
app.use(loggerMiddleware);

export default app;