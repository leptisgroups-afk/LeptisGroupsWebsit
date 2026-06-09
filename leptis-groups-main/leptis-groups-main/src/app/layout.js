import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";

// Load Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // optional: adjust as needed
  variable: "--font-poppins",
});

export const metadata = {
  title: "Leptis Group",
  description: "An elegant eCommerce website for premium fashion wear",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <SiteSettingsProvider>
          <AnnouncementBar />
          <Navbar />
          {children}
          <Footer />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
