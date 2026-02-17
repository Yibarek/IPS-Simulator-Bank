import express from "express";
import { accountVerification } from "../controllers/accountVerification.controller.js";

const router = express.Router();

router.post("/accountVerification", (req, res, next) => {
  console.log("✅ accountVerification route hit");
  next();
}, accountVerification);


// router.post("/accountVerification", accountVerification);

export default router;
