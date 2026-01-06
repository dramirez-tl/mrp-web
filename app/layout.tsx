import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MRP Tonic Life - Sistema de Planificación",
  description: "Sistema de Planificación de Recursos para Tonic Life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
