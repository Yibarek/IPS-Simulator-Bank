import axios from "axios";
import { buildAcmt023Xml } from "../utils/xacmt023XmlBuilder.util.js";

export const signAcmt023Service = async ({ creditorBank, creditorAccount }) => {
  try {
    const xmlBody = buildAcmt023Xml({ creditorBank, creditorAccount });

    const response = await axios.post(
      process.env.DIGEST_URL,
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
        timeout: 5000,
      }
    );

    return response.data;
  } catch (err) {
    throw err; 
  }
};
