import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata: Metadata = {
  title: "Duo Indumentaria — Tienda de ropa online",
  description:
    "Duo Indumentaria — Buzos, remeras, camperas, jeans y más. Envíos a todo el país. Santa Rosa, La Pampa.",
  keywords: ["indumentaria", "ropa", "Santa Rosa", "La Pampa", "buzos", "remeras", "Duo"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
