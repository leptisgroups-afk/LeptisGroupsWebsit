'use client';

import Loader from '@/components/Loader';
import React, { Suspense, useState, useRef } from 'react';
import axios from 'axios';
import { FaUser, FaPhone, FaEnvelope, FaFilePdf, FaPen, FaBuilding, FaAward, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { getApiUrl, getCleanImageUrl } from "@/data/config";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const Careers = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
        cv: null,
    });

    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState(""); // "success", "error", "info"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { settings } = useSiteSettings();
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("Submitting your application...");
        setStatusType("info");

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            await axios.post(getApiUrl("/api/career-applications/"), data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setStatus("Application submitted successfully! Our team will contact you shortly.");
            setStatusType("success");

            // Reset form
            setFormData({ name: "", phone: "", email: "", message: "", cv: null });
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err) {
            console.error("Submission error:", err);
            if (err.response && err.response.data) {
                const errors = err.response.data;
                const errorMessages = Object.keys(errors)
                    .map((field) => {
                        const msg = Array.isArray(errors[field]) ? errors[field].join(", ") : errors[field];
                        return `${field}: ${msg}`;
                    })
                    .join(" | ");
                setStatus(`Validation Error - ${errorMessages}`);
            } else {
                setStatus("Error submitting application. Please check your internet connection and try again.");
            }
            setStatusType("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const careersTitle = settings?.careers_title || "Careers at Leptis";
    const careersDesc = settings?.careers_description || "Join our growing team of dedicated professionals and build a rewarding career at Leptis Group.";

    return (
        <Suspense fallback={<Loader />}>
            <div className="bg-[#0b0f19] min-h-screen text-slate-350 font-sans">
                {/* Hero Banner */}
                <section
                    className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-start text-white overflow-hidden"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(7, 11, 17, 0.98) 30%, rgba(15, 23, 42, 0.7) 100%), url('${getCleanImageUrl(settings?.careers_bg_url) || getCleanImageUrl(settings?.hero_bg_url) || "/ship-bg.jpg"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>

                    {/* Content */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 flex flex-col justify-center text-left">
                        <span className="text-amber-500 font-extrabold uppercase text-xs sm:text-sm tracking-widest mb-3 block">
                            WE ARE HIRING
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
                            {careersTitle}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg">
                            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                            <span className="mx-2 text-slate-650">&gt;</span>
                            <span className="text-white">Careers</span>
                        </p>
                    </div>
                </section>

                {/* Main Content Split Section */}
                <section className="max-w-7xl mx-auto px-6 lg:px-16 py-24 text-left">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        
                        {/* Left Side: Culture, Stats & Info */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-5/12 space-y-8"
                        >
                            <div>
                                <span className="text-amber-500 font-bold uppercase text-xs tracking-widest mb-3 block">
                                    GROW WITH US
                                </span>
                                <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                                    Join A Team of Excellence
                                </h2>
                                <p className="text-slate-405 leading-relaxed text-sm sm:text-base font-medium">
                                    {careersDesc}
                                </p>
                            </div>

                            {/* Info Blocks */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4.5 p-5 bg-[#080b11] border border-white/5 rounded-3xl">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <FaBriefcase className="text-amber-500 text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-base">Diverse Career Paths</h4>
                                        <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold leading-relaxed">Explore opportunities across Global Logistics, Commodity Trading, Supermarket Operations, and Corporate Management.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4.5 p-5 bg-[#080b11] border border-white/5 rounded-3xl">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <FaGraduationCap className="text-amber-500 text-xl" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-base">Professional Growth</h4>
                                        <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold leading-relaxed">We support continuous training, mentorship, and upward mobility, enabling our employees to maximize their full potential.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4.5 p-5 bg-[#080b11] border border-white/5 rounded-3xl">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <FaAward className="text-amber-500 text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-base">Integrity & Respect</h4>
                                        <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold leading-relaxed">We foster a collaborative, workspace where safety, fairness, and structural transparency are priority policies.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Side: Job Application Form */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-7/12"
                        >
                            <div className="bg-[#080b11] border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6 text-left border-b border-white/5 pb-4">
                                    Submit Your Application
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                    {/* Name */}
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Full Name</label>
                                        <div className="flex items-center border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                            <FaUser className="text-slate-500 mr-3.5" />
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Enter Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full outline-none bg-transparent text-slate-200 font-semibold placeholder-slate-600 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Phone & Email Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Phone */}
                                        <div>
                                            <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Phone Number</label>
                                            <div className="flex items-center border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                                <FaPhone className="text-slate-500 mr-3.5 text-xs" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Enter number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full outline-none bg-transparent text-slate-200 font-semibold placeholder-slate-600 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Email Address</label>
                                            <div className="flex items-center border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                                <FaEnvelope className="text-slate-500 mr-3.5 text-xs" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full outline-none bg-transparent text-slate-200 font-semibold placeholder-slate-600 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Upload CV Area */}
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Upload CV (PDF)</label>
                                        <div className="relative border-2 border-dashed border-white/5 rounded-2xl p-8 hover:border-amber-500/30 hover:bg-white/5 transition-all duration-300 bg-white/5 flex flex-col items-center justify-center cursor-pointer text-center group">
                                            <input
                                                type="file"
                                                name="cv"
                                                accept=".pdf"
                                                onChange={handleChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                ref={fileInputRef}
                                                required
                                            />
                                            <FaFilePdf className="text-slate-500 text-4xl mb-3 group-hover:text-amber-500 transition-colors" />
                                            <p className="text-sm font-bold text-slate-350 group-hover:text-amber-500 transition-colors">
                                                {formData.cv ? formData.cv.name : "Select or drag your CV here"}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1.5">
                                                {formData.cv ? `${(formData.cv.size / 1024 / 1024).toFixed(2)} MB` : "Only PDF files are accepted (Max 15MB)"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block mb-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Cover Message (Optional)</label>
                                        <div className="flex border border-white/5 rounded-xl px-4 py-3 bg-white/5 transition-all duration-300 focus-within:border-[#194a9a]/40 focus-within:bg-transparent">
                                            <FaPen className="text-slate-500 mr-3.5 mt-1 text-xs" />
                                            <textarea
                                                name="message"
                                                rows="4"
                                                placeholder="Briefly describe your career objectives, experience, or notes..."
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="w-full outline-none bg-transparent text-slate-200 font-semibold placeholder-slate-600 resize-none text-sm leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* Form Submit Feedback */}
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

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full py-4 px-6 rounded-xl text-slate-950 font-black text-sm transition-all duration-300 shadow-md ${
                                                isSubmitting 
                                                    ? "bg-slate-700 cursor-not-allowed text-slate-450" 
                                                    : "bg-amber-500 hover:bg-amber-400 active:scale-[0.98]"
                                            }`}
                                            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                                                    Submitting Application...
                                                </span>
                                            ) : (
                                                "Submit Application"
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </Suspense>
    );
};

export default Careers;
