import axios from "axios";
import {
  extractTagValue,
  extractReasonValue,
} from "../utils/xml.utils.js";

let accessToken;
let refreshToken;

export const errorCode = ''
export const errorMessage = ''
export const errorDetail = ''

export const accountVerification = async ({ creditorBank, creditorAccount }) => {
  console.log("\n************************************");
  console.log("Started to send Verification Request");
  console.log("************************************\n");

  // 1️⃣ Get token
  console.log("// 1️⃣  Get token")
  try {
    const tokenResponse = await axios.post("http://localhost:5000/token");

    accessToken = tokenResponse.data.access_token;
    refreshToken = tokenResponse.data.refresh_token;

    console.log("")
    console.log("access_token:", accessToken);
    console.log("")
    console.log("refresh_token:", refreshToken);
  } catch (err) {
    // throw new Error("❌ Failed to fetch token");
    throw {
      status: err.response?.status,
      message: "❌ Failed to fetch token",
      details: err.response?.data || err.message,
    };
  }

  // 2️⃣ Sign request
  console.log("")
  console.log("// 2️⃣  Sign request")
  let verificationBody;
  try {
    const signerResponse = await axios.post(
      "http://localhost:5000/digest/acmt023",
      { creditorBank, creditorAccount }
    );

    verificationBody = signerResponse.data;
    console.log("verificationBody" + verificationBody)
  } catch (err) {
    throw new Error("❌ Failed to sign verification request");
  }

  // 3️⃣  Send request to IPS
  console.log("// 3️⃣  Send request to IPS")
  try {
    const response = await axios.post(
      process.env.IPS_INCOMMING_URL,
      verificationBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 180000,
      }
    );

    const verification = extractTagValue(response.data, "document:Vrfctn");
    const Id = extractTagValue(response.data, "document:OrgnlId");
    // const Status = extractTagValue(response.data, "document:");
    const errorcode = extractReasonValue(
      response.data,
      "document:Rsn",
      "document:Prtry"
    );

    
    let creditorName = "";
    console.log("\n********************************");

    if (verification === "true") {
      creditorName = extractTagValue(response.data, "document:Nm");

      console.log("✅ Account Verification Successful!",);
    } else {
      console.log("❌ Account Verification Failed!");
    }
    
    console.log("Id : " + Id)
    console.log("Vrfctn : " + verification)
    console.log("Creditor Name : " + creditorName)
    console.log("Response-Code : " + errorcode)
    console.log("\n********************************");
    console.log("Verification Requested Completed");
    console.log("********************************\n");

    return { creditorName, errorcode };

  } catch (err) {
    throw {
      status: err.response?.status,
      message: "❌ IPS request failed",
      details: err.response?.data || err.message,
    };
  }
};
