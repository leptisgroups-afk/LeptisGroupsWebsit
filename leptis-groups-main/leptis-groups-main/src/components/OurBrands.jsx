'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from "@/data/config";
import { motion } from "framer-motion";

export default function OurBrands() {
  const defaultBrands = [
    "/b1.png",
    "/b3.png",
    "/b2.png",
    "/b4.png",
    "/b7.jpg",
    "/b5.png",
    "/b6.png",
    "/b8.jpg",
    "/b9.jpg",
    "/b10.png",
    "/b11.png",
    "/b12.png",
  ];

  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(getApiUrl("/api/brand-logos/"));
        if (res.data && res.data.length > 0) {
          const list = res.data.map(item => item.image_url || item.image);
          setBrands(list);
        } else {
          setBrands(defaultBrands);
        }
      } catch (err) {
        console.error("Failed to load brands from API, using defaults:", err);
        setBrands(defaultBrands);
      }
    };
    fetchBrands();
  }, []);

  const displayBrands = brands.length > 0 ? brands : defaultBrands;

  // Duplicate brands to ensure smooth infinite loop scroll
  const scrollBrands = displayBrands.length < 8 
    ? [...displayBrands, ...displayBrands, ...displayBrands, ...displayBrands]
    : [...displayBrands, ...displayBrands];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full py-10 bg-[#070b11] border-y border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center mb-6">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">
          Our trusted corporate partners & client brands
        </p>
      </div>

      {/* Scrolling Wrapper with frosted fading edges */}
      <div className="relative w-full overflow-hidden mask-fade-edges select-none cursor-default">
        <div className="flex animate-scroll gap-16 items-center w-max">
          {scrollBrands.map((brand, index) => (
            <img
              key={index}
              src={brand}
              alt={`Brand Logo ${index}`}
              loading="lazy"
              className="h-10 sm:h-12 w-auto object-contain opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer"
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
