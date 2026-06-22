"use client";

import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Footer() {
    const { settings } = useSiteSettings();

    const footerAboutText = settings?.footer_about_text || 
        "Leptis Group, founded in 2016 in the UAE, has evolved into a multi-sector enterprise covering logistics, trading, exports, and retail. Our commitment to quality and customer satisfaction defines everything we do.";
    
    const fbUrl = settings?.facebook_url || "https://www.facebook.com/share/19u51ph8vv/";
    const instaUrl = settings?.instagram_url || "#";
    const linkedinUrl = settings?.linkedin_url || "#";
    const twitterUrl = settings?.twitter_url || "#";
    const copyrightText = settings?.copyright_text || "Leptis Group. All rights reserved.";
    const siteSignature = settings?.site_signature !== undefined ? settings.site_signature : "ibill software solutions llc";

    return (
        <footer className="bg-[#080b11] text-slate-400 py-16 px-6 md:px-16 border-t border-white/5 relative overflow-hidden font-sans">
            {/* Ambient light overlay */}
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#194a9a]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 border-b border-white/5 pb-14 relative z-10">

                {/* Left Section: Branding & Socials */}
                <div className="space-y-6 text-left">
                    <img src="/logo.png" alt="Logo" loading="lazy" className="w-36 h-auto mb-2 opacity-80 brightness-110" />
                    <p className="text-sm leading-relaxed text-slate-400 font-medium">
                        {footerAboutText}
                    </p>
                    <div className="flex space-x-3.5">
                        {[
                            { url: fbUrl, icon: <FaFacebookF />, label: "Facebook" },
                            { url: instaUrl, icon: <FaInstagram />, label: "Instagram" },
                            { url: linkedinUrl, icon: <FaLinkedinIn />, label: "LinkedIn" },
                            { url: twitterUrl, icon: <FaTwitter />, label: "Twitter" }
                        ].map((social, idx) => (
                            social.url && social.url.trim() !== "" && (
                                <a 
                                    key={idx}
                                    href={social.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label={social.label} 
                                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#194a9a] text-slate-400 hover:text-white flex items-center justify-center border border-white/5 hover:border-transparent transition-all duration-300 shadow-inner"
                                >
                                    {social.icon}
                                </a>
                            )
                        ))}
                    </div>
                </div>

                {/* Middle Section: Site Map Links */}
                <div className="grid grid-cols-2 gap-8 text-left md:justify-around lg:pl-10">
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-200 tracking-widest mb-5">Company</h4>
                        <ul className="space-y-3.5 text-sm font-semibold">
                            {[
                                { href: "/about", label: "About Us" },
                                { href: "/projects", label: "Our Brands" },
                                { href: "/careers", label: "Careers" },
                                { href: "/events", label: "Events" },
                                { href: "/contact", label: "Contact Us" }
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="hover:text-amber-500 transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-200 tracking-widest mb-5">Divisions</h4>
                        <ul className="space-y-3.5 text-sm font-semibold text-slate-400">
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">Logistics & Cargo</Link></li>
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">Global Export/Trading</Link></li>
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">Leptis Supermarkets</Link></li>
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">Fresh Produce Sourcing</Link></li>
                            <li><Link href="/admin" className="hover:text-amber-500 transition-colors">Admin Console</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Right Section: Newsletter */}
                <div className="space-y-6 text-left">
                    <h4 className="text-xs font-black uppercase text-slate-200 tracking-widest">Newsletter</h4>
                    <p className="text-sm leading-relaxed text-slate-400 font-medium">
                        Stay updated with Leptis corporate announcements and regional retail promotions.
                    </p>
                    <form className="flex mt-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative flex-grow flex">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="p-3.5 w-full rounded-xl rounded-r-none focus:outline-none border border-white/5 focus:border-[#194a9a]/40 text-sm text-slate-200 bg-white/5 placeholder-slate-500 font-semibold transition-colors"
                            />
                            <button
                                type="submit"
                                className="bg-[#194a9a] hover:bg-[#123673] active:scale-95 text-white px-5 rounded-r-xl text-xs font-black border-y border-r border-white/5 hover:border-transparent transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#194a9a]/10"
                            >
                                <span>SUBSCRIBE</span>
                                <FaArrowRight className="text-[10px]" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Copyright Section */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-slate-500 pt-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-center md:text-left">
                    <p>© {new Date().getFullYear()} {copyrightText}</p>
                    {siteSignature && (
                        <>
                            <span className="hidden md:inline text-slate-700">|</span>
                            <p className="text-slate-500">
                                Site by <span className="text-slate-400 hover:text-amber-500 transition-colors duration-300 font-semibold">{siteSignature}</span>
                            </p>
                        </>
                    )}
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}
