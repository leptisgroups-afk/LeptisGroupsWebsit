'use client';

import Loader from '@/components/Loader';
import React, { Suspense } from 'react';
import { 
    FaGlobe, 
    FaCheckCircle, 
    FaUserCheck, 
    FaChartLine, 
    FaShip, 
    FaTruck, 
    FaStore, 
    FaHandshake, 
    FaArrowRight, 
    FaUsers, 
    FaAward,
    FaCalendarAlt,
    FaBuilding
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

import { getCleanImageUrl } from "@/data/config";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function About() {
    const { settings } = useSiteSettings();

    const features = [
        {
            title: 'Global Reach',
            description:
                'With operations spanning across the UAE and India, we facilitate trusted logistics, trading, and retail solutions worldwide.',
            icon: <FaGlobe className="text-white text-lg" />,
            bgColor: 'bg-[#194a9a]',
            shadowColor: 'hover:shadow-[#194a9a]/10',
        },
        {
            title: 'Quality Assurance',
            description:
                'Leptis Group ensures top-quality products and services by maintaining strict standards across all business divisions.',
            icon: <FaCheckCircle className="text-white text-lg" />,
            bgColor: 'bg-amber-500',
            shadowColor: 'hover:shadow-amber-500/10',
        },
        {
            title: 'Customer Commitment',
            description:
                'We prioritize customer satisfaction through timely service, operational transparency, and responsive communication.',
            icon: <FaUserCheck className="text-white text-lg" />,
            bgColor: 'bg-emerald-500',
            shadowColor: 'hover:shadow-emerald-500/10',
        },
        {
            title: 'Innovation & Growth',
            description:
                'Leptis continually evolves by adopting modern technologies and exploring new business horizons.',
            icon: <FaChartLine className="text-white text-lg" />,
            bgColor: 'bg-orange-500',
            shadowColor: 'hover:shadow-orange-500/10',
        },
    ];

    const timelineItems = [
        {
            year: '2016',
            title: 'Foundation in UAE',
            description: 'Established in the UAE as part of Abreco Freight’s expansion, laying down core capabilities in logistics and trading.',
        },
        {
            year: '2019',
            title: 'Global Trading Corridors',
            description: 'Expanded international operations, establishing robust trading networks between the Middle East and India.',
        },
        {
            year: '2022',
            title: 'Retail Expansion & Leptis Fresh',
            description: 'Ventured into the retail supermarket sector with Leptis Fresh, bringing high-quality food, fresh produce, and modern shopping to communities.',
        },
        {
            year: 'Present',
            title: 'Conglomerate Growth',
            description: 'Operating with over 100+ dedicated employees across multiple business units, powered by innovation and unyielding customer trust.',
        },
    ];

    const businessDivisions = [
        {
            title: 'Logistics & Supply Chain',
            description: 'Comprehensive supply chain management, sea/air cargo freight forwarding, and reliable warehousing services.',
            icon: <FaTruck className="text-amber-500 text-xl" />,
        },
        {
            title: 'Global Trading & Exports',
            description: 'Bridging international markets with a reliable supply of fresh produce, commodities, and industrial supplies.',
            icon: <FaShip className="text-amber-500 text-xl" />,
        },
        {
            title: 'Retail & Supermarkets',
            description: 'Providing premium, clean, and modern grocery shopping experiences under our Leptis Fresh brand.',
            icon: <FaStore className="text-amber-500 text-xl" />,
        },
        {
            title: 'Fresh Produce Supply',
            description: 'Direct farm-to-shelf sourcing and distribution of high-quality, hygienic, and fresh agricultural products.',
            icon: <FaHandshake className="text-amber-500 text-xl" />,
        },
    ];

    // Fallbacks from backend settings
    const estYear = settings?.established_year || "2016";
    const empCount = settings?.employee_count || "100+";
    const vertCount = settings?.verticals_count || "4+";
    const compName = settings?.company_name || "Leptis Group";

    const aboutTitle = settings?.about_title || "Delivering Quality, Trust, and Modern Convenience";
    const narrative1 = settings?.about_narrative_1 || "Founded in 2016 in the United Arab Emirates, Leptis Group originated as a strategic expansion of Abreco Freight's logistics and trading operations. Since our inception, we have systematically diversified across sectors including international trading, exports, fresh agricultural produce supply, and modern retail supermarkets.";
    const narrative2 = settings?.about_narrative_2 || "Today, with extensive operations in the UAE and India, we are recognized for our unwavering reliability, global connectivity, and strict adherence to international quality standards. We believe every consumer deserves accessible, high-quality, and modern experiences, which we strive to deliver every day.";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <Suspense fallback={<Loader />}>
            <div className="bg-[#0b0f19] min-h-screen text-slate-350 overflow-x-hidden font-sans">
                {/* Hero Section */}
                <section
                    className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-start text-white overflow-hidden"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(7, 11, 17, 0.98) 30%, rgba(15, 23, 42, 0.7) 100%), url('/ship-bg.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center right",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>

                    {/* Content */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 flex flex-col justify-center text-left">
                        <span className="text-amber-500 font-extrabold uppercase text-xs sm:text-sm tracking-widest mb-3 block">
                            ESTABLISHED {estYear}
                        </span>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
                            About {compName}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg">
                            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                            <span className="mx-2 text-slate-650">&gt;</span>
                            <span className="text-white">About Us</span>
                        </p>
                    </div>
                </section>

                {/* Who We Are (Corporate Narrative) */}
                <section className="py-24 px-6 lg:px-16 border-b border-white/5 relative bg-[#0b0f19]">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        {/* Left Side: Images Grid */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-1/2 relative"
                        >
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#080b11] group">
                                <img
                                    src={getCleanImageUrl(settings?.about_team_img_url) || "/team.jpg"}
                                    alt="Leptis Group operations"
                                    loading="lazy"
                                    className="w-full h-[360px] md:h-[420px] object-cover transition-transform duration-750 ease-out group-hover:scale-103"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                            </div>

                            {/* Floating Glassmorphic Stats Card */}
                            <div className="absolute -bottom-6 -left-6 bg-[#080b11]/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/10 hidden sm:flex items-center gap-4 z-20 max-w-xs">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <FaAward className="text-amber-500 text-lg" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-sm leading-tight">Corporate Integrity</h4>
                                    <p className="text-slate-400 text-xs mt-1 font-semibold leading-normal">Built on quality and uncompromised trust since day one.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Side: Narrative */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-1/2 flex flex-col align-start text-left space-y-6"
                        >
                            <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest block">
                                WHO WE ARE
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                                {aboutTitle}
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-medium">
                                {narrative1}
                            </p>
                            <p className="text-slate-450 leading-relaxed text-sm sm:text-base font-medium">
                                {narrative2}
                            </p>

                            <div className="flex flex-wrap gap-4 items-center pt-2">
                                <Link href="/contact">
                                    <motion.button 
                                        className="bg-[#194a9a] hover:bg-[#123673] active:scale-95 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
                                        whileHover={{ y: -1 }}
                                        whileTap={{ y: 0 }}
                                    >
                                        Get in touch
                                    </motion.button>
                                </Link>
                                <Link href="/projects" className="group flex items-center gap-1.5 font-bold text-amber-500 hover:text-amber-400 transition-colors ml-4 py-2 text-sm">
                                    View Our Brands
                                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Key Statistics Grid */}
                <section className="relative py-12 px-6 lg:px-16 -mt-8 z-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { number: estYear, label: 'Established', icon: <FaCalendarAlt /> },
                                { number: empCount, label: 'Team Members', icon: <FaUsers /> },
                                { number: vertCount, label: 'Business Verticals', icon: <FaBuilding /> },
                                { number: '100%', label: 'Quality Focused', icon: <FaCheckCircle /> }
                            ].map((stat, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="bg-[#080b11]/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transition-all hover:border-white/10 hover:shadow-2xl"
                                >
                                    <div className="text-slate-500 text-base mb-2">
                                        {stat.icon}
                                    </div>
                                    <span className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
                                        {stat.number}
                                    </span>
                                    <span className="text-slate-400 font-bold text-xs sm:text-sm mt-1">
                                        {stat.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Divisions */}
                <section className="py-24 px-6 lg:px-16 bg-[#080b11]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-3">
                            <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest block">
                                WHAT WE DO
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white">
                                Our Core Business Verticals
                            </h2>
                            <p className="text-slate-450 max-w-2xl mx-auto text-sm font-semibold">
                                Across multiple industry segments, Leptis Group operates with an unwavering commitment to quality, speed, and integrity.
                            </p>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {businessDivisions.map((division, idx) => (
                                <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    whileHover={{ y: -4 }}
                                    className="bg-[#0b0f19] p-8 rounded-3xl border border-white/5 shadow-sm transition-all duration-300 hover:border-white/10 hover:shadow-2xl text-left"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                        {division.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2.5">
                                        {division.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-semibold">
                                        {division.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Timeline / Corporate Journey */}
                <section className="bg-[#0b0f19] py-24 px-6 lg:px-16 border-t border-b border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-3">
                            <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest block">
                                THE JOURNEY
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white">
                                Our Corporate Milestones
                            </h2>
                            <p className="text-slate-450 max-w-2xl mx-auto text-sm font-semibold">
                                A timeline of growth, adaptation, and consistent customer satisfaction.
                            </p>
                        </div>

                        {/* Timeline Marker line */}
                        <div className="relative border-l-2 border-white/5 ml-4 md:ml-12 max-w-4xl mx-auto pl-8 md:pl-10 space-y-12 text-left">
                            {timelineItems.map((item, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                                    className="relative group"
                                >
                                    {/* Marker Pin */}
                                    <div className="absolute -left-[41px] md:-left-[49px] top-2.5 w-5 h-5 rounded-full border-[3px] border-[#0b0f19] bg-slate-700 group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300 shadow-md"></div>
                                    
                                    <div className="bg-[#080b11] border border-white/5 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:bg-[#0c101a] hover:border-white/10">
                                        <span className="inline-block px-3 py-1 bg-white/5 text-amber-500 font-black text-xs rounded-xl mb-3 border border-white/5 select-none">
                                            {item.year}
                                        </span>
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="bg-[#080b11] py-24 px-6 lg:px-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-3">
                            <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest block">
                                OUR STRENGTHS
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white">
                                Why Partner With Us
                            </h2>
                            <p className="text-slate-450 max-w-2xl mx-auto text-sm font-semibold">
                                We believe our deep domain experience, global reach, and client dedication set us apart in the global marketplace.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className={`bg-[#0b0f19] p-6.5 rounded-3xl border border-white/5 shadow-sm transition-all duration-300 hover:border-white/10 hover:shadow-2xl flex flex-col h-full text-left`}
                                >
                                    <div className="flex items-center gap-4.5 mb-4">
                                        <div className={`w-11 h-11 flex items-center justify-center rounded-2xl ${feature.bgColor} text-white shadow-md`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-base font-black text-white">{feature.title}</h3>
                                    </div>
                                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-2 flex-grow font-semibold">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-6 lg:px-16 bg-[#194a9a] relative overflow-hidden text-center">
                    {/* Background shapes */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                    <div className="max-w-5xl mx-auto relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Build Your Growth With Us
                        </h2>
                        <p className="text-slate-200 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-semibold">
                            Whether you need robust global logistics, reliable supply chains, or top-tier product trading, Leptis Group is your trusted partner.
                        </p>
                        <div className="flex justify-center pt-4">
                            <Link href="/contact">
                                <motion.button 
                                    className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg shadow-amber-500/10 transition-all duration-300"
                                    whileHover={{ y: -1, scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    Partner With Us Today
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Suspense>
    );
}
