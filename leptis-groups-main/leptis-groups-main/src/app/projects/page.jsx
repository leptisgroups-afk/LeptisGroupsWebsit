"use client";

import Loader from "@/components/Loader";
import { fetchProjects } from "@/data/data";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { FaBuilding, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { getApiUrl, getCleanImageUrl } from "@/data/config";
import { motion } from "framer-motion";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            try {
                const res = await axios.get(getApiUrl("/api/projects/"));
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map(item => ({
                        id: item.id,
                        title: item.title,
                        image: item.main_image_url || item.main_image
                    }));
                    setProjects(mapped);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to fetch projects from API, using static:", e);
            }
            // Fallback
            setProjects(fetchProjects());
            setLoading(false);
        };
        loadProjects();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <Suspense fallback={<Loader />}>
            <div className="bg-[#0b0f19] min-h-screen text-slate-350 font-sans pb-24">
                {/* Banner Section */}
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
                            LEPTIS PORTFOLIO
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
                            Our Brands & Outlets
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg">
                            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                            <span className="mx-2 text-slate-650">&gt;</span>
                            <span className="text-white">Our Brands</span>
                        </p>
                    </div>
                </section>

                {/* Brands Grid Section */}
                <section className="my-20 max-w-7xl mx-auto px-6 lg:px-16">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-amber-500 font-bold uppercase text-xs tracking-widest block">
                            WHAT WE OPERATE
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white">
                            Operational Verticals & Business Brands
                        </h2>
                        <p className="text-slate-450 max-w-2xl mx-auto text-sm sm:text-base font-semibold">
                            Explore our retail outlets, supermarket brands, and dining locations across the region, built on trust and top-tier service.
                        </p>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {projects.map((project, index) => (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                whileHover={{ y: -4 }}
                                className="group bg-[#080b11] rounded-3xl overflow-hidden border border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <Link href={`/projects/${project.id}`} className="block flex-grow flex flex-col justify-between">
                                    <div className="relative h-72 w-full overflow-hidden bg-white/5 border-b border-white/5">
                                        <img
                                            src={getCleanImageUrl(project.image)}
                                            alt={project.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#070b11]/50 to-transparent opacity-90 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>

                                    <div className="p-6 text-left flex items-center justify-between gap-4">
                                        <div>
                                            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-1.5 select-none">
                                                <FaBuilding className="text-slate-500 text-xs" />
                                                LEPTIS BRAND
                                            </span>
                                            <h3 className="text-white font-extrabold text-base leading-snug group-hover:text-amber-500 transition-colors">
                                                {project.title}
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#194a9a] group-hover:text-white flex items-center justify-center text-slate-400 transition-all duration-300 flex-shrink-0 border border-white/5">
                                            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </div>
        </Suspense>
    );
}
