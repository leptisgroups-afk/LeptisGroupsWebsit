import React from "react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FiPhone } from "react-icons/fi";

export default function AnnouncementBar() {
  return (
    <div className="bg-[#0b0f19] border-b border-white/5 text-slate-400 text-xs py-2.5 font-medium transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-6 lg:px-16">
        
        {/* Info Left */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
            <MdLocationOn className="text-amber-500 text-sm" />
            <span>Dubai, UAE</span>
          </div>

          <span className="text-slate-800 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
            <MdEmail className="text-amber-500 text-sm" />
            <a href="mailto:info@leptisgroups.com" className="hover:underline">
              info@leptisgroups.com
            </a>
          </div>

          <span className="text-slate-800 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
            <FiPhone className="text-amber-500 text-sm" />
            <a href="tel:+9742505549" className="hover:underline">
              +971 4 250 5549
            </a>
          </div>
        </div>

        {/* Social Right */}
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold select-none hidden sm:inline">Connect with us</span>
          <div className="flex items-center gap-3">
            <a 
              href="https://www.facebook.com/share/19u51ph8vv/" 
              target="_blank" 
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all duration-200"
            >
              <FaFacebookF className="text-xs" />
            </a>
            <a 
              href="https://www.linkedin.com/company/leptis-groups/" 
              target="_blank" 
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all duration-200"
            >
              <FaLinkedinIn className="text-xs" />
            </a>
          </div>
        </div>
        
      </div>
    </div>
  );
}
