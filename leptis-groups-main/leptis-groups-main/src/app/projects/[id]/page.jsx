"use client";

import { fetchSingleProject } from '@/data/data';
import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from "next/navigation";
import Loader from '@/components/Loader';
import Link from 'next/link';
import { FaBuilding, FaArrowLeft, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { getApiUrl, getCleanImageUrl } from '@/data/config';
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ProjectDetails() {
    const { settings } = useSiteSettings();
    const params = useParams();
    const { id } = params;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            setLoading(true);
            try {
                // Try fetching from the database API
                const res = await axios.get(getApiUrl(`/api/projects/${id}/`));
                if (res.data) {
                    const mappedProject = {
                        id: res.data.id,
                        title: res.data.title,
                        image: res.data.images.map(img => ({
                            image: getCleanImageUrl(img.image_url || img.image),
                            title: img.title || ""
                        }))
                    };
                    setProject(mappedProject);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.log("Could not fetch project from API, attempting local fallback:", err);
            }

            // Fallback to static data
            const staticProject = fetchSingleProject(id);
            setProject(staticProject || null);
            setLoading(false);
        };

        if (id) {
            loadProject();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-slate-500 font-sans">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Brand Not Found</h2>
                    <Link href="/projects" className="text-amber-500 font-bold hover:underline">
                        Return to Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<Loader />}>
            <div className="bg-[#0b0f19] min-h-screen text-slate-350 font-sans pb-16">
                {/* Banner Section */}
                <section
                    className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-start text-white overflow-hidden"
                    style={{
                        background: `linear-gradient(to right, rgba(7, 11, 17, 0.98) 30%, rgba(15, 23, 42, 0.7) 100%), url('${getCleanImageUrl(settings?.brands_bg_url) || "/ship-bg.jpg"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center right",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>

                    {/* Content */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 flex flex-col justify-center">
                        <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest mb-3 block">
                            BRAND DETAILS
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white">
                            {project.title}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg text-left">
                            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                            <span className="mx-2 text-slate-650">&gt;</span>
                            <Link href="/projects" className="hover:text-amber-500 transition-colors">Our Brands</Link>
                            <span className="mx-2 text-slate-650">&gt;</span>
                            <span className="text-white truncate max-w-[180px] inline-block align-bottom">{project.title}</span>
                        </p>
                    </div>
                </section>

                {/* Gallery Grid Section */}
                <section className="my-16 max-w-7xl mx-auto px-6 lg:px-16">
                    {/* Back button */}
                    <div className="mb-10 text-left">
                        <Link 
                            href="/projects" 
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#080b11] border border-white/5 hover:border-amber-500 rounded-xl shadow-sm text-sm font-bold text-slate-300 hover:text-white transition-all"
                        >
                            <FaArrowLeft className="text-xs" />
                            Back to Portfolio
                        </Link>
                    </div>

                    <div className="text-left mb-12">
                        <span className="text-amber-500 font-bold uppercase text-sm tracking-widest mb-2 block">
                            GALLERY SHOWCASE
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-snug">
                            Outlets & Locations Portfolio
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-semibold">
                            Visual breakdown of operations and outlets managed under the {project.title} division.
                        </p>
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {project.image && project.image.map((pro, index) => (
                            <div
                                key={index}
                                className="group bg-[#080b11] rounded-3xl overflow-hidden border border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="relative h-80 w-full overflow-hidden bg-white/5 border-b border-white/5">
                                    <img
                                        src={pro.image}
                                        alt={pro.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 text-white font-bold text-sm gap-2">
                                        <FaEye />
                                        <span>View Image</span>
                                    </div>
                                </div>
                                <div className="p-5 text-left border-t border-white/5">
                                    <span className="text-amber-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 block">
                                        OUTLET LOCATION
                                    </span>
                                    <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight">
                                        {pro.title}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </Suspense>
    );
}
