import express from "express";
import authRoutes from "./Routes/auth.routes.js";
import accountVerificationRoutes from "./routes/accountVerification.routes.js";
import pushPaymentRoutes from "./Routes/pushPayment.routes.js";
import acmt023DigestRoutes from "./Routes/xacmt023Digest.routes.js"

import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "*/*" }));

app.use("/api/auth", authRoutes);

// app.use("/api", accountVerificationRoutes); 
// app.use("/api", pushPaymentRoutes); 

app.use("/digest", acmt023DigestRoutes);

// Health check
app.get("/health", (req, res) => {
  res.send("OK");
});



export default app;

