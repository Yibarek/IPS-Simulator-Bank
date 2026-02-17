import express from "express";
import { signAcmt023 } from "../controllers/xacmt023Digest.controller.js";

const router = express.Router();

router.post("/acmt023", signAcmt023);

export default router;
