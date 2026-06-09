"use client";

import Loader from "@/components/Loader";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl, getCleanImageUrl } from "@/data/config";
import { 
  FaMapMarkerAlt, FaRegCalendarAlt, FaCalendarCheck, FaCalendarTimes, 
  FaFilePdf, FaFilter, FaArrowRight, FaChevronLeft, FaChevronRight, 
  FaDownload, FaEye, FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("");

  // Modal & Slide Show state
  const [openModal, setOpenModal] = useState(false);
  const [selectedOfferPDFs, setSelectedOfferPDFs] = useState([]);
  const [selectedOfferTitle, setSelectedOfferTitle] = useState("");
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [pageChanging, setPageChanging] = useState(false);
  const [viewMode, setViewMode] = useState("cover"); // "cover" or "pdf"
  const [imageErrors, setImageErrors] = useState({});
  const [mainThumbnailErrors, setMainThumbnailErrors] = useState({});

  // Load offers from backend
  useEffect(() => {
    fetch(getApiUrl("/api/offers/"), { cache: "no-store"})
      .then((res) => res.json())
      .then((data) => {
        setOffers(data);
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  }, []);

  // Check if an offer is expired
  const isExpired = (expireDate) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  };

  // Filter logic combining category and active status
  useEffect(() => {
    let result = offers;

    // Filter by branch category
    if (category) {
      result = result.filter((o) => o.category === category);
    }

    // Always only show active (non-expired) offers
    result = result.filter((o) => !isExpired(o.expire_date));

    setFiltered(result);
  }, [category, offers]);

  // Open modal with PDFs
  const handleOpenModal = (pdfs, title) => {
    if (Array.isArray(pdfs) && pdfs.length > 0) {
      setSelectedOfferPDFs(pdfs);
      setSelectedOfferTitle(title);
      setActivePageIndex(0);
      setPageChanging(false);
      setViewMode("cover");
      setImageErrors({});
      setOpenModal(true);
    } else {
      alert("No PDFs available for this offer");
    }
  };

  const handlePageChange = (index) => {
    if (index < 0 || index >= selectedOfferPDFs.length) return;
    setPageChanging(true);
    setTimeout(() => {
      setActivePageIndex(index);
      setPageChanging(false);
    }, 200);
  };

  // Open PDF in new tab
  const openPDF = (url) => {
    if (!url) return alert("PDF not found");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Format category name for nice display
  const formatCategory = (cat) => {
    if (!cat) return "";
    return cat
      .replace(/_/g, " ")
      .toUpperCase();
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

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
          }}
        >
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 flex flex-col justify-center text-left">
            <span className="text-amber-500 font-extrabold uppercase text-xs sm:text-sm tracking-widest mb-3 block">
              PROMOTIONS & DEALS
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
              Our Latest Offers
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg">
              <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
              <span className="mx-2 text-slate-650">&gt;</span>
              <span className="text-white">Offers</span>
            </p>
          </div>
        </section>

        {/* Main Content Layout */}
        <section className="my-20 max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
            
            {/* Sidebar Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-[#080b11] border border-white/5 p-6 rounded-3xl shadow-lg text-left space-y-5">
                <h3 className="text-base font-black text-white flex items-center gap-2 pb-3.5 border-b border-white/5">
                  <FaFilter className="text-amber-500 text-xs" />
                  Filter Options
                </h3>

                {/* Branch Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Branch</label>
                  <select
                    className="w-full border border-white/5 rounded-xl p-3 bg-white/5 focus:border-[#194a9a]/40 focus:outline-none transition-all text-xs font-semibold text-slate-300"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" className="bg-[#080b11] text-slate-300">All Locations</option>
                    <option value="dubai_lassi_home" className="bg-[#080b11] text-slate-300">Dubai - Lassi Home Shop</option>
                    <option value="rak_hamrah" className="bg-[#080b11] text-slate-300">RAK - Leptis Al Hamrah</option>
                    <option value="rak_marjan" className="bg-[#080b11] text-slate-300">RAK - Leptis Supermarket Marjan</option>
                    <option value="alain_spicy" className="bg-[#080b11] text-slate-300">Al Ain - Spicy Village</option>
                    <option value="alain_leptis" className="bg-[#080b11] text-slate-300">Al Ain - Leptis Al Ain</option>
                  </select>
                </div>

              </div>
            </motion.div>

            {/* Offers Grid */}
            <div className="lg:col-span-3">
              {filtered.length > 0 ? (
                <motion.div 
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 text-left"
                >
                  {filtered.map((offer) => {
                    const firstPdfId = offer.pdfs?.[0]?.id;
                    const mainThumbnail = getCleanImageUrl(offer.pdfs?.[0]?.thumbnail_url) || "";
                    const expired = isExpired(offer.expire_date);
                    const hasThumbnailError = firstPdfId ? mainThumbnailErrors[firstPdfId] : false;
                    
                    return (
                      <motion.div
                        key={offer.id}
                        variants={cardVariants}
                        whileHover={{ y: -4 }}
                        className="group bg-[#080b11] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-white/5 transition-all duration-300 flex flex-col justify-between"
                        onClick={() => handleOpenModal(offer.pdfs, offer.title)}
                      >
                        {/* Image preview with Badges */}
                        <div className="relative overflow-hidden cursor-pointer bg-white/5 h-80 flex items-center justify-center border-b border-white/5">
                          {mainThumbnail && !hasThumbnailError ? (
                            <img
                              src={mainThumbnail}
                              alt={offer.title}
                              loading="lazy"
                              onError={() => {
                                if (firstPdfId) {
                                  setMainThumbnailErrors(prev => ({ ...prev, [firstPdfId]: true }));
                                }
                              }}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-550 gap-2">
                              <FaFilePdf className="text-4xl text-slate-600" />
                              <span className="text-xs font-bold">No PDF Preview</span>
                            </div>
                          )}

                          {/* Expiry Badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md shadow-md ${
                              expired ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {expired ? "Expired" : "Active"}
                            </span>
                          </div>
                        </div>

                        {/* Description Text */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="text-white font-extrabold text-base group-hover:text-amber-500 transition-colors leading-tight">
                              {offer.title}
                            </h3>
                            <p className="text-slate-500 font-bold text-xs flex items-center gap-1.5 pb-2">
                              <FaMapMarkerAlt className="text-slate-600" />
                              {formatCategory(offer.category)}
                            </p>
                          </div>

                          {/* Bottom Stats: Expiry Date */}
                          <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[11px] font-black text-slate-500 mt-2">
                            <span className="flex items-center gap-1.5">
                              <FaRegCalendarAlt className="text-slate-600" />
                              {offer.expire_date ? `Expires: ${new Date(offer.expire_date).toLocaleString()}` : "Indefinite Offer"}
                            </span>
                            <span className="text-[#194a9a] group-hover:text-amber-500 transition-colors flex items-center gap-1">
                              View Catalogue
                              <FaArrowRight className="text-[10px]" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="bg-[#080b11] border border-white/5 rounded-3xl p-16 text-center shadow-lg">
                  <p className="text-slate-500 font-bold text-sm">
                    No offers found matching your current filter selections.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal for PDF Selection */}
        <AnimatePresence>
          {openModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[#080b11] border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl text-left"
              >
                
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-slate-500 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all z-20"
                  onClick={() => setOpenModal(false)}
                >
                  <FaTimes className="text-sm" />
                </button>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-1 pr-10">{selectedOfferTitle}</h2>
                <p className="text-slate-500 text-xs sm:text-sm mb-5 pb-3 border-b border-white/5 font-semibold">
                  Browse catalogue pages interactively below or view the official document.
                </p>

                {/* Main Preview Container with Floating Arrows */}
                <div className="relative min-h-[300px] sm:min-h-[450px] flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl p-4 overflow-hidden shadow-inner">
                  {/* Floating Left Arrow */}
                  {activePageIndex > 0 && (
                    <button 
                      onClick={() => handlePageChange(activePageIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#080b11]/90 border border-white/10 hover:border-amber-500 text-slate-350 hover:text-amber-500 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-10"
                      title="Previous Page"
                    >
                      <FaChevronLeft className="text-sm" />
                    </button>
                  )}

                  {/* Floating Right Arrow */}
                  {activePageIndex < selectedOfferPDFs.length - 1 && (
                    <button 
                      onClick={() => handlePageChange(activePageIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#080b11]/90 border border-white/10 hover:border-amber-500 text-slate-350 hover:text-amber-500 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-10"
                      title="Next Page"
                    >
                      <FaChevronRight className="text-sm" />
                    </button>
                  )}

                  {/* Animated Inner Content */}
                  <div className={`w-full h-full flex items-center justify-center transition-all duration-300 transform ${pageChanging ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    {selectedOfferPDFs[activePageIndex] ? (
                      (viewMode === "cover" && selectedOfferPDFs[activePageIndex].thumbnail_url && !imageErrors[selectedOfferPDFs[activePageIndex].id]) ? (
                        <img 
                          src={getCleanImageUrl(selectedOfferPDFs[activePageIndex].thumbnail_url)} 
                          alt="Offer Page" 
                          onError={() => {
                            setImageErrors(prev => ({ ...prev, [selectedOfferPDFs[activePageIndex].id]: true }));
                          }}
                          className="max-h-[280px] sm:max-h-[420px] w-auto object-contain rounded-lg shadow-md border border-white/5 hover:scale-[1.01] transition-transform duration-300"
                        />
                      ) : (
                        /* Fallback: Render PDF in iframe */
                        <div className="w-full h-[280px] sm:h-[420px] rounded-xl overflow-hidden border border-white/5 shadow-inner">
                          <iframe 
                            src={getCleanImageUrl(selectedOfferPDFs[activePageIndex].pdf_url)} 
                            className="w-full h-full bg-white"
                            title="PDF Reader"
                          />
                        </div>
                      )
                    ) : (
                      <span className="text-slate-500 text-sm">Page not available</span>
                    )}
                  </div>
                </div>

                {/* Control Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-5 border-t border-white/5 pt-4 gap-4">
                  <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto border border-white/5">
                    <button 
                      onClick={() => setViewMode("cover")}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === "cover" ? "bg-[#194a9a] text-white shadow-sm" : "text-slate-500 hover:text-slate-350"}`}
                    >
                      Flyer View
                    </button>
                    <button 
                      onClick={() => setViewMode("pdf")}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === "pdf" ? "bg-[#194a9a] text-white shadow-sm" : "text-slate-500 hover:text-slate-350"}`}
                    >
                      Interactive PDF Reader
                    </button>
                  </div>
                  
                  {selectedOfferPDFs[activePageIndex] && (
                    <motion.button 
                      onClick={() => openPDF(getCleanImageUrl(selectedOfferPDFs[activePageIndex].pdf_url))}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
                      whileTap={{ scale: 0.99 }}
                    >
                      <FaDownload className="text-xs" />
                      <span>Open / Download PDF</span>
                    </motion.button>
                  )}
                </div>

                {/* Bottom Thumbnail Strip */}
                {selectedOfferPDFs.length > 1 && (
                  <div className="mt-5 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">
                      Flyer Pages ({activePageIndex + 1} of {selectedOfferPDFs.length})
                    </span>
                    <div className="flex gap-3 overflow-x-auto justify-start sm:justify-center py-2 px-1 scrollbar-thin">
                      {selectedOfferPDFs.map((pdf, idx) => (
                        <button
                          key={pdf.id}
                          onClick={() => handlePageChange(idx)}
                          className={`relative rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${activePageIndex === idx ? "border-amber-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                          {pdf.thumbnail_url && !imageErrors[pdf.id] ? (
                            <img 
                              src={getCleanImageUrl(pdf.thumbnail_url)} 
                              alt={`Page ${idx + 1}`} 
                              onError={() => {
                                setImageErrors(prev => ({ ...prev, [pdf.id]: true }));
                              }}
                              className="w-10 h-14 object-cover" 
                            />
                          ) : (
                            <div className="w-10 h-14 bg-white/5 border border-white/5 flex flex-col items-center justify-center text-slate-500 text-[8px] font-bold">
                              <FaFilePdf className="text-xs mb-1" />
                              <span>P.{idx + 1}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </Suspense>
  );
}
