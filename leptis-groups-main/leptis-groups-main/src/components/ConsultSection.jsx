"use client";

import React from "react";
import { FaArrowRight, FaGlobe, FaClock, FaTruck, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

import { getCleanImageUrl } from "@/data/config";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ConsultSection() {
  const { settings } = useSiteSettings();

  const consultImg = getCleanImageUrl(settings?.consult_img_url) || '/consultbg.png';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="bg-[#050811] text-white py-28 px-6 lg:px-20 relative overflow-hidden border-y border-white/[0.03]">
      {/* Premium Ambient Lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-t from-blue-600/10 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

      {/* Modern Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 relative z-10">
        
        {/* Left Column (Main Image & Floating Infographics) */}
        <div className="w-full lg:w-[45%] flex justify-center items-center relative min-h-[400px] md:min-h-[480px] lg:min-h-[520px] select-none">
          {/* Ambient Glow behind the image */}
          <div className="absolute inset-0 m-auto w-[280px] h-[280px] md:w-[360px] md:h-[360px] bg-gradient-to-tr from-amber-500/10 to-blue-500/10 rounded-full blur-3xl opacity-75 animate-pulse pointer-events-none"></div>

          {/* Pedestal / Tech Platform decoration */}
          <div className="absolute bottom-0 w-[80%] h-3 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rounded-full blur-sm"></div>

          {/* Main Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 35 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex justify-center items-center"
          >
            <motion.img
              src={consultImg}
              alt="Consultation and Logistics Services"
              loading="lazy"
              className="w-[280px] md:w-[360px] lg:w-[380px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
          </motion.div>

          {/* Floating Glassmorphic Badges */}
          
          {/* Badge 1: Global Network */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute top-[12%] left-[-2%] md:left-[5%] lg:left-[-8%] z-20 pointer-events-auto"
          >
            <motion.div
              animate={{
                y: [0, -12, 0]
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
              }}
              className="bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl hover:border-amber-500/30 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <FaGlobe className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Logistics</p>
                <h4 className="text-xs font-bold text-white">Global Network</h4>
              </div>
            </motion.div>
          </motion.div>

          {/* Badge 2: Secured */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-[28%] right-[-2%] md:right-[5%] lg:right-[-6%] z-20 pointer-events-auto"
          >
            <motion.div
              animate={{
                y: [-8, 8, -8]
              }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
              }}
              className="bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl hover:border-amber-500/30 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <FaShieldAlt className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Security</p>
                <h4 className="text-xs font-bold text-white">100% Protected</h4>
              </div>
            </motion.div>
          </motion.div>

          {/* Badge 3: Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-[5%] left-[5%] md:left-[15%] lg:left-[2%] z-20 pointer-events-auto"
          >
            <motion.div
              animate={{
                y: [0, -15, 0]
              }}
              transition={{
                duration: 4.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
              }}
              className="bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl hover:border-amber-500/30 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <FaClock className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Response</p>
                <h4 className="text-xs font-bold text-white">24/7 Support</h4>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column (Content & Styled Benefit Grid) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full lg:w-[55%] flex flex-col justify-center text-left space-y-8"
        >
          {/* Subtitle with Pulsing Indicator */}
          <motion.div variants={itemVariants} className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-amber-500 font-bold uppercase text-xs md:text-sm tracking-[0.2em] block">
              NEED LOGISTICS HELP?
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-black mb-4 leading-[1.15] text-slate-50 tracking-tight">
            Consult the Services <br className="hidden sm:inline" />
            You <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent font-black relative drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)] text-gradient-amber">Need Now!</span>
          </motion.h2>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-slate-400 leading-relaxed text-sm md:text-base font-normal max-w-xl">
            Our trade and logistics experts are ready to assist you with fast, reliable, and cost-effective shipping and supply chain solutions across regional hubs and global markets.
          </motion.p>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 pt-2">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -5, borderColor: "rgba(245, 158, 11, 0.3)" }}
              className="bg-slate-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 transition-colors duration-300">
                <FaTruck className="text-base" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 mb-1">Global Delivery</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Air, land & sea solutions.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -5, borderColor: "rgba(245, 158, 11, 0.3)" }}
              className="bg-slate-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 transition-colors duration-300">
                <FaShieldAlt className="text-base" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 mb-1">Competitive Rates</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Cost-optimized routing.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -5, borderColor: "rgba(245, 158, 11, 0.3)" }}
              className="bg-slate-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 transition-colors duration-300">
                <FaGlobe className="text-base" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 mb-1">Multimodal</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Procurement & sourcing.</p>
              </div>
            </motion.div>

          </motion.div>

          {/* Action Button */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 pt-4">
            <Link href="/contact" className="relative group">
              <motion.button 
                className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm md:text-base px-9 py-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center gap-3 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glossy shine overlay */}
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                <span>Contact Us</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
