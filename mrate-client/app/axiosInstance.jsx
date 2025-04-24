import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Check the URL to decide whether to send the token
    if (
      !config.url.includes("/auth/register") &&
      !config.url.includes("/auth/authenticate")
    ) {
      // Retrieve token from cookies
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
      const tokenCookie = cookies.find((cookie) =>
        cookie.startsWith("accessToken=")
      );
      const token = tokenCookie ? tokenCookie.split("=")[1] : null;

      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
