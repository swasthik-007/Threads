import express from "express";
import { processAICommand } from "../controllers/aiController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/process", protectRoute, processAICommand);

export default router;
