import { ReactNode } from "react";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";

interface MainLayoutProps {
  children: ReactNode;
  showWhatsAppCTA?: boolean;
}

export default function MainLayout({
  children,
  showWhatsAppCTA = true
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {showWhatsAppCTA && (
        <a
          href="https://wa.me/971XXXXXXXX"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
          aria-label="Chat on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M12.001 2.002c-5.522 0-9.999 4.477-9.999 9.999 0 1.87.522 3.681 1.512 5.26l-1.512 5.738 5.739-1.514c1.58.989 3.39 1.515 5.26 1.515 5.522 0 9.998-4.477 9.998-9.999s-4.476-10-9.998-10zm0 18.173c-1.632 0-3.223-.49-4.582-1.415l-.328-.199-3.397.893.894-3.397-.199-.328c-.924-1.359-1.414-2.951-1.414-4.583 0-4.57 3.72-8.291 8.291-8.291s8.29 3.72 8.29 8.291-3.72 8.29-8.29 8.29zm4.835-6.207c-.25-.125-1.472-.726-1.7-.809-.228-.082-.395-.123-.56.124-.166.248-.641.808-.784.973-.144.164-.289.184-.539.06-.25-.125-1.054-.388-2.007-1.238-.742-.661-1.242-1.475-1.388-1.725-.144-.248-.015-.383.11-.506.112-.112.248-.292.372-.438.124-.146.166-.25.248-.415.083-.164.042-.308-.02-.433-.063-.125-.56-1.349-.767-1.849-.202-.486-.407-.42-.56-.428-.144-.007-.31-.009-.476-.009-.166 0-.435.062-.662.31-.227.25-.866.847-.866 2.066 0 1.219.889 2.396 1.013 2.56.125.166 1.75 2.666 4.229 3.739.59.254 1.05.407 1.41.521.593.189 1.133.162 1.56.098.475-.071 1.46-.598 1.667-1.176.205-.58.205-1.073.144-1.176-.062-.104-.228-.166-.478-.29z"></path>
          </svg>
        </a>
      )}
      <Footer />
    </div>
  );
}