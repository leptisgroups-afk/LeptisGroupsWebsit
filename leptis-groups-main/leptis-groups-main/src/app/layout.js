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

export async function generateMetadata() {
  try {
    const res = await fetch("http://127.0.0.1:8001/api/site-settings/", {
      next: { revalidate: 60 } // cache settings for 60 seconds
    });
    if (res.ok) {
      const settings = await res.json();
      return {
        metadataBase: new URL("https://leptisgroups.com"),
        title: settings.meta_title || "Leptis Group",
        description: settings.meta_description || "Leptis Group - Logistics, Global Trading, Supermarkets & Fresh Produce",
        keywords: settings.meta_keywords || "leptis, leptis group, logistics, trading, supermarket, fresh produce",
        icons: {
          icon: settings.site_logo_url || "/favicon.ico",
          shortcut: settings.site_logo_url || "/favicon.ico",
          apple: settings.site_logo_url || "/favicon.ico",
        },
        openGraph: {
          title: settings.meta_title || "Leptis Group",
          description: settings.meta_description || "Leptis Group - Logistics, Global Trading, Supermarkets & Fresh Produce",
          images: [
            {
              url: settings.share_image_url || "/logo.png",
              width: 800,
              height: 600,
              alt: "Leptis Group Logo",
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch dynamic layout metadata:", error);
  }

  // Fallback metadata
  return {
    metadataBase: new URL("https://leptisgroups.com"),
    title: "Leptis Group",
    description: "Leptis Group - Logistics, Global Trading, Supermarkets & Fresh Produce",
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
    openGraph: {
      title: "Leptis Group",
      description: "Leptis Group - Logistics, Global Trading, Supermarkets & Fresh Produce",
      images: [
        {
          url: "/logo.png",
          width: 800,
          height: 600,
          alt: "Leptis Group Logo",
        },
      ],
    },
  };
}

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
