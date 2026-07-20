import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes - allow through
  const publicPaths = ["/login", "/register", "/api/auth", "/api/customers/lookup", "/api/tracking"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === "/") {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    const role = session.user?.role;
    if (role === "OWNER") return NextResponse.redirect(new URL("/owner/dashboard", req.url));
    if (role === "EMPLOYEE") return NextResponse.redirect(new URL("/employee/dashboard", req.url));
    if (role === "CUSTOMER") return NextResponse.redirect(new URL("/customer/dashboard", req.url));
  }

  // Not logged in — redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user?.role;

  // Role-based route protection with graceful route remapping
  if (pathname.startsWith("/owner") && role !== "OWNER") {
    if (role === "EMPLOYEE") return NextResponse.redirect(new URL(pathname.replace("/owner", "/employee"), req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
    if (role === "OWNER") return NextResponse.redirect(new URL(pathname.replace("/employee", "/owner"), req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
