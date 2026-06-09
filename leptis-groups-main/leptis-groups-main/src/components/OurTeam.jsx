'use client';

import React, { useEffect, useState } from "react";
import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import PrimaryButton from "./PrimaryButton";
import Link from "next/link";
import axios from "axios";
import { getApiUrl, getCleanImageUrl } from "@/data/config";
import { motion } from "framer-motion";

const defaultTeamMembers = [
  {
    name: "Leptis Group",
    position: "Our Winning Team",
    image: '/lepteam1.jpeg',
    facebook_url: "#",
    twitter_url: "#",
    youtube_url: "#"
  },
  {
    name: "Leptis Fresh Super market",
    position: "Our Winning Team",
    image: '/lepteam2.jpeg',
    facebook_url: "#",
    twitter_url: "#",
    youtube_url: "#"
  },
];

export default function OurTeam() {
  const [teamList, setTeamList] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get(getApiUrl("/api/team-members/"));
        if (res.data && res.data.length > 0) {
          setTeamList(res.data);
        } else {
          setTeamList(defaultTeamMembers);
        }
      } catch (err) {
        console.error("Failed to load team members, using defaults:", err);
        setTeamList(defaultTeamMembers);
      }
    };
    fetchTeam();
  }, []);

  const displayTeam = teamList.length > 0 ? teamList : defaultTeamMembers;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="bg-[#0b0f19] py-28 px-6 lg:px-16 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#194a9a]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* Left Side Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/3 text-left space-y-6"
        >
          <span className="text-amber-500 font-bold uppercase text-xs sm:text-sm tracking-widest block">
            LEPTIS TEAM
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Our Team
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm font-medium">
            Leptis aims to deliver a unique shopping experience through top-quality products and services while exploring new markets and creating lasting value. Known for trust and reliability, we offer diverse products at competitive prices with uncompromised quality. Today, over 100+ employees across the UAE drive our growth and commitment.
          </p>
          <div className="pt-2">
            <Link href="/about">
              <motion.button 
                className="bg-[#194a9a] hover:bg-[#123673] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Right Side - Team Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="w-full lg:w-2/3 grid sm:grid-cols-2 gap-8"
        >
          {displayTeam.map((member, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl group border border-white/5 bg-[#080b11] h-[400px] transition-all duration-300"
            >
              <img
                src={getCleanImageUrl(member.image_url || member.image)}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b11]/95 via-[#070b11]/30 to-transparent opacity-90 transition-opacity duration-300"></div>

              {/* Social Icons (Sleek slide-in animation from top) */}
              <div className="absolute top-5 right-5 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                <a
                  href={member.facebook_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/10 hover:border-transparent flex items-center justify-center transition-all duration-200"
                >
                  <FaFacebookF className="text-xs" />
                </a>
                <a
                  href={member.twitter_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/10 hover:border-transparent flex items-center justify-center transition-all duration-200"
                >
                  <FaTwitter className="text-xs" />
                </a>
                <a
                  href={member.youtube_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/10 hover:border-transparent flex items-center justify-center transition-all duration-200"
                >
                  <FaYoutube className="text-xs" />
                </a>
              </div>

              {/* Text Content */}
              <div className="absolute bottom-6 left-6 text-left">
                <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">{member.name}</h3>
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{member.position}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
