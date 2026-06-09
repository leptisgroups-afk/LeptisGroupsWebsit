"use client";

import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

import { getCleanImageUrl } from "@/data/config";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function HomeAboutSection() {
    const { settings } = useSiteSettings();

    const estYear = settings?.established_year || "2016";
    const compName = settings?.company_name || "Leptis Group";
    const aboutTitle = settings?.about_title || "Delivering Quality, Trust, and Modern Convenience.";
    
    // Build a nice snippet out of about_narrative_1 or use default
    const aboutSnippet = settings?.about_narrative_1 
        ? (settings.about_narrative_1.length > 250 ? settings.about_narrative_1.substring(0, 250) + "..." : settings.about_narrative_1)
        : `Founded in ${estYear} in the UAE, ${compName} began as part of Abreco Freight’s expansion into logistics and trading. Since then, it has grown across sectors like trading, fresh produce, exports, and retail—earning a reputation for reliability and excellence.`;

    return (
        <section className="bg-[#0b0f19] py-28 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-16 text-left relative z-10">
                
                {/* Left Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full lg:w-1/2 space-y-6"
                >
                    <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest block">
                        WHO WE ARE
                    </span>

                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                        {aboutTitle}
                    </h2>

                    <p className="text-slate-450 leading-relaxed text-sm sm:text-base font-medium">
                        {aboutSnippet}
                    </p>

                    {/* Glass card panel */}
                    <div className="flex items-start gap-4.5 p-6 bg-white/5 border border-white/5 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#194a9a]/10 rounded-full blur-xl pointer-events-none"></div>
                        <FaCheckCircle className="text-amber-500 mt-1 text-xl flex-shrink-0" />
                        <div>
                            <h4 className="font-extrabold text-slate-100 text-sm sm:text-base leading-snug">
                                Quality, Service, and Absolute Customer Satisfaction
                            </h4>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed font-medium">
                                Our dedicated teams constantly adapt to shifting market environments, ensuring hygienic, secure, and modern logistics and retail experiences.
                            </p>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <Link href="/about">
                            <motion.button 
                                className="bg-[#194a9a] hover:bg-[#123673] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-[#194a9a]/10 transition-all duration-300"
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 0 }}
                            >
                                Discover More &rarr;
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Image with Framer Motion hover zooms */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative w-full lg:w-1/2 flex justify-center"
                >
                    {/* Visual Border Frame */}
                    <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] border border-white/5 rounded-3xl pointer-events-none hidden sm:block"></div>
                    <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#0b0f19] w-full group">
                        <img
                            src={getCleanImageUrl(settings?.home_about_img_url) || "/homeabout.jpg"}
                            alt="Warehouse operations"
                            loading="lazy"
                            className="object-cover w-full h-[280px] sm:h-[340px] md:h-[400px] transition-transform duration-700 ease-out group-hover:scale-103"
                        />
                    </div>
                </motion.div>
                
            </div>
        </section>
    );
}
