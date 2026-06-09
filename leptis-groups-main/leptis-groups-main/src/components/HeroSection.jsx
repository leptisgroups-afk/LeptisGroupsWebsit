"use client";

import React from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

import { getCleanImageUrl } from "@/data/config";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function HeroSection() {
  const { settings } = useSiteSettings();

  const heroBg = getCleanImageUrl(settings?.hero_bg_url) || '/ship-bg.jpg';
  const compName = settings?.company_name || "Leptis Group";

  // Dynamic hero texts with static defaults
  const heroTitle = settings?.hero_title || "Advancing Growth Through Innovative & Trusted Solutions";
  const heroDesc = settings?.hero_description || `Take your operations to the next level with ${compName}'s global expertise spanning Logistics, International Trading, Retail Supermarkets, and Fresh Agricultural Sourcing.`;
  const heroBtn1 = settings?.hero_btn1_text || "Partner With Us";
  const heroBtn2 = settings?.hero_btn2_text || "Discover More";

  // Highlight the last two words of the dynamic title in amber
  const words = heroTitle.split(" ");
  const mainText = words.length > 2 ? words.slice(0, words.length - 2).join(" ") : heroTitle;
  const highlightText = words.length > 2 ? words.slice(words.length - 2).join(" ") : "";

  // Framer Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-start text-white overflow-hidden bg-[#070b11]">
      {/* Background Image with Premium Multi-stage Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center select-none pointer-events-none transition-all duration-700 brightness-75 opacity-90 scale-102"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(7, 11, 17, 0.98) 25%, rgba(11, 15, 25, 0.8) 55%, rgba(25, 74, 154, 0.25) 100%), url('${heroBg}')`,
          backgroundPosition: "center right",
        }}
      />

      {/* Grid Pattern Overlay (Stripe Style) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] mask-fade-edges opacity-45 pointer-events-none"></div>

      {/* Ambient Gradient Glow Blobs */}
      <div className="absolute -top-40 right-10 w-96 h-96 bg-[#194a9a]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 text-left py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Floating Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <span className="bg-[#194a9a]/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-amber-500 border border-white/5 tracking-widest shadow-inner uppercase">
              {compName} OF COMPANIES
            </span>
          </motion.div>

          {/* Premium Headline */}
          <motion.h1 
            variants={itemVariants} 
            className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.08] tracking-tight max-w-3xl text-white"
          >
            {mainText}{" "}
            {highlightText && (
              <span className="text-gradient-amber font-black">{highlightText}</span>
            )}
          </motion.h1>

          {/* Paragraph */}
          <motion.p 
            variants={itemVariants} 
            className="text-slate-350 text-base sm:text-lg max-w-2xl leading-relaxed font-medium"
          >
            {heroDesc}
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 items-center pt-4">
            <Link href="/contact">
              <motion.button 
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base px-8 py-4.5 rounded-2xl shadow-lg hover:shadow-amber-500/10 flex items-center gap-2 transition-all duration-300"
                whileHover={{ y: -1.5, scale: 1.01 }}
                whileTap={{ y: 0, scale: 0.99 }}
              >
                <span>{heroBtn1}</span>
                <FaArrowRight className="text-xs" />
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button 
                className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm sm:text-base px-8 py-4.5 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300"
                whileHover={{ y: -1.5 }}
                whileTap={{ y: 0 }}
              >
                {heroBtn2}
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
