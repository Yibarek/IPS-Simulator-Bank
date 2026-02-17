import axios from "axios";

export const getUserErrorMessage = (err) => {
  // if (!axios.isAxiosError(err)) {
  //   return "Unexpected error occurred. Please check debug log.";
  // }

  // if (err.code === "ERR_BAD_RESPONSE") {
  //   return "The service is temporarily unavailable. Please check debug-log.";
  // }

  if (err.code === "ECONNABORTED") {
    return "Request timed out! Please check the connectivity.";
  }

  if (err.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (err.response?.status === 403) {
    return "You are not allowed to perform this action.";
  }

  if (err.response?.status === 404) {
    return "Requested resource was not found.";
  }

  return err.message + ". Please check debug-log";
};
