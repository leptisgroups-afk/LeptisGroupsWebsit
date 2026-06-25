"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getCleanImageUrl } from "@/data/config";

export default function Navbar() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("leptis_admin_token") : null;
      setIsLoggedIn(!!token);
    };

    checkAuth();

    if (typeof window !== "undefined") {
      window.addEventListener("storage", checkAuth);
      window.addEventListener("leptis_auth_change", checkAuth);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", checkAuth);
        window.removeEventListener("leptis_auth_change", checkAuth);
      }
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("leptis_admin_token");
      localStorage.removeItem("leptis_admin_logged");
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("leptis_auth_change"));
      window.location.href = "/";
    }
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300">
      {/* Frosted Glass Background */}
      <div className="absolute inset-0 bg-[#0b0f19]/70 backdrop-blur-xl border-b border-white/5 pointer-events-none"></div>

      <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-16 py-4.5">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group relative z-10">
          <motion.img
            src={getCleanImageUrl(settings?.site_logo_url) || "/logo.png"}
            alt="Logo"
            className="w-36 h-auto brightness-100 hover:brightness-110 transition-all duration-300 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-1.5 font-medium text-sm text-slate-300">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center relative hover:text-white ${
                    isActive ? "text-amber-500 font-bold" : "text-slate-400"
                  }`}
                >
                  {/* Subtle active background */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-white/5 border border-white/5 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions Menu right (Admin Portal Quick Redirect) */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin">
              <motion.button 
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-500 font-bold text-xs shadow-sm hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                Admin Console
              </motion.button>
            </Link>
            <motion.button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-300 hover:text-red-400 font-bold text-xs shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              Logout
            </motion.button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <motion.button
            className="text-slate-300 hover:text-white text-2xl p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center relative z-10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </motion.button>
        </div>

      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#0b0f19]/95 backdrop-blur-2xl border-b border-white/5"
          >
            <ul className="flex flex-col items-stretch px-6 py-6 space-y-2.5">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                        isActive 
                          ? "bg-white/5 text-amber-500 border-l-4 border-amber-500 pl-3" 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
              {isLoggedIn && (
                <>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="pt-4 border-t border-white/5"
                  >
                    <Link 
                      href="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#001c48] font-black text-sm text-center shadow-lg transition-colors"
                    >
                      Admin Console
                    </Link>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-sm text-center transition-colors"
                    >
                      Logout
                    </button>
                  </motion.li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
