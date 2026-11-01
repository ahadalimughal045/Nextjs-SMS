import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "school-sms-jwt-super-secret-key-2026"
);

// Define allowed role routes
const ROLE_ROUTES = {
  super_admin: ["/super_admin", "/dashboard", "/my_account", "/api"],
  admin: ["/admin", "/dashboard", "/my_account", "/api", "/students", "/classes", "/sections", "/subjects", "/exams", "/grades", "/dorms", "/books", "/payments", "/pins", "/timetables", "/marks", "/settings", "/users"],
  teacher: ["/dashboard", "/my_account", "/api", "/students", "/classes", "/sections", "/subjects", "/marks", "/timetables", "/books"],
  student: ["/dashboard", "/my_account", "/marks", "/timetables", "/payments", "/books"],
  parent: ["/dashboard", "/my_account", "/my_children", "/marks", "/payments"],
  accountant: ["/dashboard", "/my_account", "/api", "/payments"],
  librarian: ["/dashboard", "/my_account", "/api", "/books"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js assets should be ignored
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // matches image files, css, etc.
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session_token")?.value;

  // 1. Unauthenticated users visiting protected pages
  if (!token) {
    if (pathname !== "/login" && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Authenticated users checking token validity
  let payload: any = null;
  try {
    const { payload: jwtPayload } = await jwtVerify(token, JWT_SECRET);
    payload = jwtPayload;
  } catch (error) {
    // If JWT is invalid, clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session_token");
    return response;
  }

  // 3. User is authenticated, redirect away from login page to dashboard
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Role-based routing validation
  const userRole = payload.user_type as string;

  // Super Admin can access everything
  if (userRole === "super_admin") {
    return NextResponse.next();
  }

  // Check if current path matches role's permissions
  const allowedPaths = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || [];
  const isAllowed = allowedPaths.some(
    (allowedPath) => pathname.startsWith(allowedPath) || pathname === "/"
  );

  // If user is at root "/", redirect them to /dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAllowed) {
    // Redirect unauthorized access back to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (handled internally)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
