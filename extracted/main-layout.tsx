import Footer from "@/polymet/components/footer";
import Header from "@/polymet/components/header";
import WhatsAppCTA from "@/polymet/components/whatsapp-cta";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  showWhatsAppCTA?: boolean;
}

export default function MainLayout({
  children,
  showWhatsAppCTA = true,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {showWhatsAppCTA && <WhatsAppCTA />}
    </div>
  );
}
