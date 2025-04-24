import jwt from "jsonwebtoken";

const getToken = () => {
  // Add check for document
  if (typeof document === "undefined") return null;

  return document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("accessToken="))
    ?.split("=")[1];
};

export const getUsername = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null;
  }

  // Get accessToken from cookies using vanilla JS
  const accessToken = getToken();

  if (!accessToken) {
    return null;
  }

  try {
    const decoded = jwt.decode(accessToken);
    return decoded?.sub || null;
  } catch (error) {
    console.error("Error decoding access token:", error);
    return null;
  }
};

export const getUserId = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null;
  }

  // Get accessToken from cookies using vanilla JS
  const accessToken = getToken();

  if (!accessToken) {
    return null;
  }

  try {
    const decoded = jwt.decode(accessToken);
    return decoded?.userId || null;
  } catch (error) {
    console.error("Error decoding access token:", error);
    return null;
  }
};

export const isAdmin = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false;
  }

  // Get accessToken from cookies using vanilla JS
  const accessToken = getToken();

  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwt.decode(accessToken);
    return decoded?.roles.includes("ADMIN") || null;
  } catch (error) {
    console.error("Error decoding access token:", error);
    return null;
  }
};
