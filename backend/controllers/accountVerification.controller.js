import * as verificationService from "../services/accountVerification.service.js";

export const accountVerification = async (req, res) => {
  try {
    const result = await verificationService.accountVerification(req.body);

    res.status(200).json(result);
  } catch (err) {
    console.error("REMOTE ERROR:", err.response?.status, "\nError Message" , err.message, "\n", err.details);

    res.status(err.status || 500).json({
      error: "❌ Account verification request failed",
      details: err.details || err.message, 
    });
  }
};
