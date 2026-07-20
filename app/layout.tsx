import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourierOS — DTDC Franchise Management",
  description:
    "Franchise Operations Management System for DTDC courier franchises. Manage bookings, tracking, employees, and analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
