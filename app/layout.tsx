import type { Metadata } from "next";
import "./globals.css";
import MessagesProvider from "@/datasources/messagesContext";

export const metadata: Metadata = {
  title: "Commonwealth AI",
  description: "an obviously simple political digest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
