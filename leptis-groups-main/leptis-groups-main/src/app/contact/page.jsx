'use client';

import Loader from '@/components/Loader';
import React, { Suspense, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaPaperPlane, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaPen } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { getApiUrl } from "@/data/config";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Page() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState(""); // "success", "error", "info"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { settings } = useSiteSettings();

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("Sending message...");
        setStatusType("info");

        try {
            await axios.post(getApiUrl("/api/contact-messages/"), form);
            setStatus("Thank you! Your message has been sent successfully.");
            setStatusType("success");
            setForm({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => {
                setStatus("");
                setStatusType("");
            }, 6000);
        } catch (err) {
            console.error("Message send error:", err);
            setStatus("Failed to send message. Please try again later.");
            setStatusType("error");
            setTimeout(() => {
                setStatus("");
                setStatusType("");
            }, 6000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactEmail = settings?.contact_email || "info@leptisgroups.com";
    const contactPhone = settings?.contact_phone || "+971 4 250 5549";
    const contactAddress = settings?.contact_address || "Al Jazeera Al Hamra, Ras Al Khaimah, UAE";

    return (
        <Suspense fallback={<Loader />}>
            <div className="bg-[#0b0f19] min-h-screen text-slate-350 font-sans">
                {/* Banner Section */}
                <section
                    className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-start text-white overflow-hidden"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(7, 11, 17, 0.98) 30%, rgba(15, 23, 42, 0.7) 100%), url('/ship-bg.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center right",
                    }}
                >
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>

                    {/* Content */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 flex flex-col justify-center text-left">
                        <span className="text-amber-500 font-extrabold uppercase text-xs sm:text-sm tracking-widest mb-3 block">
                            GET IN TOUCH
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
                            Contact Our Team
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg">
                            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                            <span className="mx-2 text-slate-650">&gt;</span>
                            <span className="text-white">Contact Us</span>
                        </p>
                    </div>
                </section>

                {/* Main Layout Split Section */}
                <section className="max-w-7xl mx-auto px-6 lg:px-16 py-24 text-left">
                    <div className="flex flex-col lg:flex-row gap-16 items-stretch">
                        
                        {/* Left Side: Contact Form */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-7/12"
                        >
                            <div className="bg-[#080b11] border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl h-full flex flex-col justify-between">
                                <div className="space-y-3">
                                    <span className="text-amber-500 font-bold uppercase text-xs tracking-widest block">
                                        MESSAGE US
                                    </span>
                                    <h3 className="text-3xl font-black text-white leading-tight">
                                        Let's Start a Conversation
                                    </h3>
                                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-semibold pb-4">
                                        Have a question about our logistics, trading, or retail operations? Send us a message, and our representatives will respond to you promptly.
                                    </p>
                                </div>

                                <form onSubmit={submitHandler} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Your Name</label>
                                            <div className="flex items-center border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                                <FaUser className="text-slate-500 mr-3.5" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    placeholder="Enter name"
                                                    className="w-full outline-none bg-transparent text-slate-205 font-semibold placeholder-slate-600 text-sm"
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Your Email</label>
                                            <div className="flex items-center border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                                <FaEnvelope className="text-slate-500 mr-3.5 text-xs" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={form.email}
                                                    placeholder="Enter email"
                                                    className="w-full outline-none bg-transparent text-slate-205 font-semibold placeholder-slate-600 text-sm"
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Subject</label>
                                        <div className="flex items-center border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                            <FaPen className="text-slate-500 mr-3.5 text-xs" />
                                            <input
                                                type="text"
                                                name="subject"
                                                value={form.subject}
                                                placeholder="Enter subject"
                                                className="w-full outline-none bg-transparent text-slate-205 font-semibold placeholder-slate-600 text-sm"
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Message</label>
                                        <div className="flex border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                            <FaPen className="text-slate-500 mr-3.5 mt-1 text-xs" />
                                            <textarea
                                                name="message"
                                                rows="4"
                                                value={form.message}
                                                placeholder="Write your message details..."
                                                className="w-full outline-none bg-transparent text-slate-205 font-semibold placeholder-slate-600 resize-none text-sm leading-relaxed"
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Feedback message banner */}
                                    {status && (
                                        <div className={`p-4 rounded-xl text-xs font-bold border ${
                                            statusType === "success" 
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                                : statusType === "error" 
                                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                                                : "bg-[#194a9a]/10 border-[#194a9a]/20 text-slate-300"
                                        }`}>
                                            {status}
                                        </div>
                                    )}

                                    {/* Button */}
                                    <div className="pt-2">
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full py-4 px-6 rounded-xl text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                                                isSubmitting 
                                                    ? "bg-slate-700 cursor-not-allowed text-slate-450" 
                                                    : "bg-amber-500 hover:bg-amber-400 active:scale-[0.98]"
                                            }`}
                                            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-slate-955 border-t-transparent rounded-full animate-spin"></span>
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send Message</span>
                                                    <FaPaperPlane className="text-xs" />
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>

                        {/* Right Side: Contact Information Cards */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-5/12 flex flex-col justify-between gap-6"
                        >
                            <ContactCard
                                icon={<FaEnvelope className="text-lg" />}
                                title="Email Address"
                                text={contactEmail}
                                link={`mailto:${contactEmail}`}
                                hoverColor="hover:border-blue-500/30 hover:shadow-blue-500/5"
                                bgIcon="bg-white/5 text-amber-500"
                            />
                            
                            <ContactCard
                                icon={<FaPhone className="text-lg" />}
                                title="Call Center"
                                text={contactPhone}
                                link={`tel:${contactPhone}`}
                                hoverColor="hover:border-emerald-500/30 hover:shadow-emerald-500/5"
                                bgIcon="bg-white/5 text-amber-500"
                            />

                            <ContactCard
                                icon={<FaMapMarkerAlt className="text-lg" />}
                                title="Visit Office"
                                text={contactAddress}
                                link={`https://maps.google.com/?q=${encodeURIComponent(contactAddress)}`}
                                hoverColor="hover:border-amber-500/30 hover:shadow-amber-500/5"
                                bgIcon="bg-white/5 text-amber-500"
                            />

                            {/* Decorative Block */}
                            <div className="flex-grow bg-gradient-to-br from-[#194a9a] to-[#0d2a58] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-end min-h-[160px]">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                                
                                <div className="relative z-10 space-y-1">
                                    <h4 className="text-xl font-bold">Corporate Headquarters</h4>
                                    <p className="text-slate-350 text-xs sm:text-sm leading-relaxed font-semibold">
                                        Our support staff is active Sunday through Friday, managing operations bridging regional hubs and local communities.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </Suspense>
    );
}

const ContactCard = ({ icon, title, text, link, hoverColor, bgIcon }) => (
    <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`bg-[#080b11] border border-white/5 p-6 rounded-3xl flex items-center gap-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${hoverColor} block`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bgIcon} shadow-sm border border-white/5`}>
            {icon}
        </div>
        <div className="overflow-hidden text-left">
            <h4 className="text-slate-500 font-extrabold text-xs uppercase tracking-wider mb-1">{title}</h4>
            <p className="text-white font-black text-sm sm:text-base truncate">{text}</p>
        </div>
    </a>
);
