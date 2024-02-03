import type { Metadata } from "next";
import "./globals.css";
import MessagesProvider from "@/datasources/messagesContext";

export const metadata: Metadata = {
  title: "Influence AI",
  description: "Generative AI search for brand ambassadors",
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
