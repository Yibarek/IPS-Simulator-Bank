import { signAcmt023Service } from "../services/xacmt0234Digest.service.js";

export const signAcmt023 = async (req, res) => {
  try {
    const result = await signAcmt023Service(req.body);
    res.status(200).send(result);
  } catch (err) {
    console.error("❌ Error in ACMT023 signing:", err.message);

    // directly return error response
    res.status(err.response?.status || 500).json({
      error: "❌ Failed to Sign Verification API",
      details: err.response?.data || err.message,
    });
  }
};
