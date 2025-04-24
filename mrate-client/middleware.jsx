import { NextResponse } from "next/server";

// Helper function to validate JWT token
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    return exp > currentTime;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

// Helper function to check admin role from token
const checkAdminRole = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const { roles } = JSON.parse(jsonPayload);
    return roles.includes("ADMIN");
  } catch (error) {
    console.error("Error validating admin role:", error);
    return false;
  }
};

// Constants
const PUBLIC_PATHS = ["/login", "/signup", "/setup"];
const BYPASS_PATHS = [
  "/_next/",
  "/static/",
  "/api/",
  "/manifest",
  "/favicon",
  "/service-worker",
];

// Helper to clear auth cookie
const clearAuthCookie = (response) => {
  response.headers.set(
    "Set-Cookie",
    "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  );
  return response;
};

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip middleware for non-document requests
  if (BYPASS_PATHS.some((path) => pathname.includes(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  // Handle cases with no token
  if (!token) {
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const valid = isTokenValid(token);

  // Handle valid token cases
  if (valid) {
    // Redirect to home if trying to access login/signup with valid token
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check admin access for admin routes
    if (pathname.includes("/admin") && !checkAdminRole(token)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Handle invalid token cases
  const response = PUBLIC_PATHS.includes(pathname)
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", req.url));

  return clearAuthCookie(response);
}
