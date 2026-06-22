"use client";

import Loader from "@/components/Loader";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl, getCleanImageUrl } from "@/data/config";
import { 
  FaMapMarkerAlt, FaRegCalendarAlt, 
  FaFilePdf, FaFilter, FaArrowRight, FaChevronLeft, FaChevronRight, 
  FaDownload, FaTimes, FaPlus, FaMinus, FaRedo, FaExpand, FaCompress
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const isImageFile = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].split('#')[0];
  return /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanUrl);
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("");

  // Modal & Slide Show state
  const [openModal, setOpenModal] = useState(false);
  const [selectedEventPDFs, setSelectedEventPDFs] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [pageChanging, setPageChanging] = useState(false);
  const [branches, setBranches] = useState([]);
  const [viewMode, setViewMode] = useState("cover"); // "cover" or "pdf"
  const [imageErrors, setImageErrors] = useState({});
  const [mainThumbnailErrors, setMainThumbnailErrors] = useState({});
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(0);

  // Dynamic client-side PDF rendering states
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [modalPages, setModalPages] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load PDF.js from CDN dynamically on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !window.pdfjsLib) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
      script.onload = () => {
        const pdfjs = window.pdfjsLib;
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
          setPdfjsLoaded(true);
        } else {
          console.error("pdfjsLib global not found");
        }
      };
      script.onerror = () => console.error("Failed to load PDF.js from CDN");
      document.body.appendChild(script);
    } else if (typeof window !== "undefined" && window.pdfjsLib) {
      setPdfjsLoaded(true);
    }
  }, []);

  // Keyboard navigation & interaction handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!openModal) return;
      
      switch (e.key) {
        case "ArrowLeft":
          if (activePageIndex > 0) {
            handlePageChange(activePageIndex - 1);
          }
          break;
        case "ArrowRight":
          if (activePageIndex < modalPages.length - 1) {
            handlePageChange(activePageIndex + 1);
          }
          break;
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            setOpenModal(false);
          }
          break;
        case "+":
        case "=":
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case "-":
        case "_":
          setZoom(prev => Math.max(prev - 0.25, 0.5));
          break;
        case "r":
        case "R":
          setRotation(prev => (prev + 90) % 360);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openModal, activePageIndex, modalPages.length, isFullscreen]);

  // Load events and branches from backend
  useEffect(() => {
    fetch(getApiUrl("/api/events/"), { cache: "no-store"})
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => console.error("FETCH ERROR:", err));

    fetch(getApiUrl("/api/branches/"), { cache: "no-store"})
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
      })
      .catch((err) => console.error("BRANCH FETCH ERROR:", err));
  }, []);

  // Check if an event is expired
  const isExpired = (expireDate) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  };

  // Filter logic combining category and active status
  useEffect(() => {
    let result = events;

    // Filter by branch category
    if (category) {
      result = result.filter((e) => e.category === category);
    }

    // Always only show active (non-expired) events
    result = result.filter((e) => !isExpired(e.expire_date));

    setFiltered(result);
  }, [category, events]);

  // Open modal and load event details dynamically
  const handleOpenModal = async (pdfs, title) => {
    if (!Array.isArray(pdfs) || pdfs.length === 0) {
      alert("No event details available for this event");
      return;
    }

    setOpenModal(true);
    setSelectedEventTitle(title);
    setLoadingDetails(true);
    setModalPages([]);
    setActivePageIndex(0);
    setViewMode("cover");
    setZoom(1);
    setRotation(0);

    const pagesList = [];

    try {
      for (const file of pdfs) {
        const fileUrl = getCleanImageUrl(file.pdf_url);
        
        if (isImageFile(fileUrl)) {
          pagesList.push({
            id: `img_${file.id}`,
            type: "image",
            url: fileUrl,
            downloadUrl: fileUrl
          });
        } else {
          // Attempt client-side rendering with PDF.js
          const pdfjsLib = typeof window !== "undefined" ? window.pdfjsLib : null;
          if (pdfjsLib) {
            try {
              const loadingTask = pdfjsLib.getDocument(fileUrl);
              const pdf = await loadingTask.promise;
              
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                // Increased rendering scale to 2.0 for higher clarity text
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const dataUrl = canvas.toDataURL("image/jpeg");
                
                pagesList.push({
                  id: `pdf_${file.id}_page_${pageNum}`,
                  type: "pdf-page",
                  url: dataUrl,
                  downloadUrl: fileUrl,
                  pageNum: pageNum,
                  totalPages: pdf.numPages
                });
              }
            } catch (pdfErr) {
              console.error("PDF.js render failed for:", fileUrl, pdfErr);
              pagesList.push({
                id: `fallback_${file.id}`,
                type: "pdf-fallback",
                url: fileUrl,
                thumbnail: getCleanImageUrl(file.thumbnail_url),
                downloadUrl: fileUrl
              });
            }
          } else {
            // PDF.js not ready, use standard iframe/thumbnail fallback
            pagesList.push({
              id: `fallback_${file.id}`,
              type: "pdf-fallback",
              url: fileUrl,
              thumbnail: getCleanImageUrl(file.thumbnail_url),
              downloadUrl: fileUrl
            });
          }
        }
      }
      setModalPages(pagesList);
    } catch (err) {
      console.error("Error loading event details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePageChange = (index) => {
    if (index < 0 || index >= modalPages.length) return;
    setDirection(index > activePageIndex ? 1 : -1);
    setPageChanging(true);
    // Reset interactive zoom and rotation on page navigation
    setZoom(1);
    setRotation(0);
    setTimeout(() => {
      setActivePageIndex(index);
      setPageChanging(false);
    }, 200);
  };

  // Open PDF in new tab using blob URL to hide server file path
  const openPDF = async (url) => {
    if (!url) return alert("PDF not found");
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to load PDF as blob:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Format category name for nice display
  const formatCategory = (cat) => {
    if (!cat) return "";
    const matched = branches.find(b => b.key === cat);
    if (matched) return matched.name.toUpperCase();
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
              EVENTS & PROMOTIONS
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
              Our Latest Events
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-semibold max-w-lg">
              <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
              <span className="mx-2 text-slate-650">&gt;</span>
              <span className="text-white">Events</span>
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
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.key} className="bg-[#080b11] text-slate-300">
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </motion.div>

            {/* Events Grid */}
            <div className="lg:col-span-3">
              {filtered.length > 0 ? (
                <motion.div 
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 text-left"
                >
                  {filtered.map((event) => {
                    const firstPdfId = event.pdfs?.[0]?.id;
                    const isFirstFileImage = event.pdfs?.[0]?.pdf_url ? isImageFile(event.pdfs[0].pdf_url) : false;
                    const mainThumbnail = getCleanImageUrl(event.pdfs?.[0]?.thumbnail_url) || (isFirstFileImage ? getCleanImageUrl(event.pdfs[0].pdf_url) : "");
                    const expired = isExpired(event.expire_date);
                    const hasThumbnailError = firstPdfId ? mainThumbnailErrors[firstPdfId] : false;
                    
                    return (
                      <motion.div
                        key={event.id}
                        variants={cardVariants}
                        whileHover={{ y: -4 }}
                        className="group bg-[#080b11] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-white/5 transition-all duration-300 flex flex-col justify-between"
                        onClick={() => handleOpenModal(event.pdfs, event.title)}
                      >
                        {/* Image preview with Badges */}
                        <div className="relative overflow-hidden cursor-pointer bg-white/5 h-80 flex items-center justify-center border-b border-white/5">
                          {mainThumbnail && !hasThumbnailError ? (
                            <img
                              src={mainThumbnail}
                              alt={event.title}
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
                              <span className="text-xs font-bold">No Preview Available</span>
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
                              {event.title}
                            </h3>
                            <p className="text-slate-500 font-bold text-xs flex items-center gap-1.5 pb-2">
                              <FaMapMarkerAlt className="text-slate-600" />
                              {formatCategory(event.category)}
                            </p>
                          </div>

                          {/* Bottom Stats: Expiry Date */}
                          <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[11px] font-black text-slate-500 mt-2">
                            <span className="flex items-center gap-1.5">
                              <FaRegCalendarAlt className="text-slate-600" />
                              {event.expire_date ? `Expires: ${new Date(event.expire_date).toLocaleString()}` : "Indefinite Event"}
                            </span>
                            <span className="text-[#194a9a] group-hover:text-amber-500 transition-colors flex items-center gap-1">
                              View PDF
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
                    No events found matching your current filter selections.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal for PDF Selection */}
        <AnimatePresence>
          {openModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 15 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="bg-[#080b11] border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl text-left"
              >
                
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-slate-500 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all z-20"
                  onClick={() => setOpenModal(false)}
                >
                  <FaTimes className="text-sm" />
                </button>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-1 pr-10">{selectedEventTitle}</h2>
                <p className="text-slate-500 text-xs sm:text-sm mb-5 pb-3 border-b border-white/5 font-semibold">
                  Browse event details interactively below or view the official document.
                </p>

                {/* Main Preview Container with Floating Arrows */}
                <div className="relative min-h-[300px] sm:min-h-[450px] flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl p-4 overflow-hidden shadow-inner">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader />
                      <span className="text-xs font-bold animate-pulse text-amber-500">Rendering high-quality details...</span>
                    </div>
                  ) : (
                    <>
                      {/* Floating Toolbar */}
                      {modalPages[activePageIndex] && (modalPages[activePageIndex].type === "image" || modalPages[activePageIndex].type === "pdf-page" || (viewMode === "cover" && modalPages[activePageIndex].thumbnail)) && (
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-405 hover:text-white hover:bg-white/10 transition-all"
                            title="Zoom In (+)"
                          >
                            <FaPlus className="text-[10px]" />
                          </button>
                          <span className="text-[9px] font-black text-slate-300 px-0.5 select-none w-10 text-center">
                            {Math.round(zoom * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-405 hover:text-white hover:bg-white/10 transition-all"
                            title="Zoom Out (-)"
                          >
                            <FaMinus className="text-[10px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setZoom(1); setRotation(0); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-405 hover:text-white hover:bg-white/10 transition-all text-[9px] font-bold"
                            title="Reset View"
                          >
                            1:1
                          </button>
                          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
                          <button
                            type="button"
                            onClick={() => setRotation(prev => (prev + 90) % 360)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-405 hover:text-white hover:bg-white/10 transition-all"
                            title="Rotate (R)"
                          >
                            <FaRedo className="text-[10px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFullscreen(true)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-450 hover:text-white hover:bg-white/10 transition-all"
                            title="Fullscreen View"
                          >
                            <FaExpand className="text-[10px]" />
                          </button>
                        </div>
                      )}

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
                      {activePageIndex < modalPages.length - 1 && (
                        <button 
                          onClick={() => handlePageChange(activePageIndex + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#080b11]/90 border border-white/10 hover:border-amber-500 text-slate-350 hover:text-amber-500 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-10"
                          title="Next Page"
                        >
                          <FaChevronRight className="text-sm" />
                        </button>
                      )}

                      {/* Animated Inner Content (Slide Swipe Page swap) */}
                      <div className="w-full h-[280px] sm:h-[420px] relative overflow-hidden flex items-center justify-center">
                        <AnimatePresence initial={false} custom={direction}>
                          <motion.div
                            key={activePageIndex}
                            custom={direction}
                            variants={{
                              enter: (direction) => ({
                                x: direction > 0 ? "100%" : "-100%",
                                opacity: 0
                              }),
                              center: {
                                x: 0,
                                opacity: 1
                              },
                              exit: (direction) => ({
                                x: direction < 0 ? "100%" : "-100%",
                                opacity: 0
                              })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                              x: { type: "spring", stiffness: 300, damping: 30 },
                              opacity: { duration: 0.25 }
                            }}
                            className="absolute inset-0 w-full h-full flex items-center justify-center"
                          >
                            {modalPages[activePageIndex] ? (
                              modalPages[activePageIndex].type === "image" || modalPages[activePageIndex].type === "pdf-page" ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center overflow-auto scrollbar-none select-none"
                                  style={{ cursor: zoom > 1 ? "grab" : "default" }}
                                >
                                  <img 
                                    src={modalPages[activePageIndex].url} 
                                    alt="Event Detail" 
                                    className="transition-transform duration-205 ease-out origin-center rounded-lg shadow-md border border-white/5"
                                    style={{
                                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                      objectFit: "contain"
                                    }}
                                  />
                                </div>
                              ) : (viewMode === "cover" && modalPages[activePageIndex].thumbnail) ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center overflow-auto scrollbar-none select-none"
                                  style={{ cursor: zoom > 1 ? "grab" : "default" }}
                                >
                                  <img 
                                    src={modalPages[activePageIndex].thumbnail} 
                                    alt="Event Page" 
                                    className="transition-transform duration-205 ease-out origin-center rounded-lg shadow-md border border-white/5"
                                    style={{
                                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                      objectFit: "contain"
                                    }}
                                  />
                                </div>
                              ) : (
                                /* Fallback: Render PDF in iframe */
                                <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 shadow-inner">
                                  <iframe 
                                    src={`${modalPages[activePageIndex].url}#toolbar=0&navpanes=0`} 
                                    className="w-full h-full bg-white"
                                    title="PDF Reader"
                                  />
                                </div>
                              )
                            ) : (
                              <span className="text-slate-500 text-sm">Page not available</span>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>

                {/* Control Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-5 border-t border-white/5 pt-4 gap-4">
                  {!loadingDetails && modalPages[activePageIndex]?.type === "pdf-fallback" ? (
                    <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto border border-white/5">
                      <button 
                        onClick={() => setViewMode("cover")}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === "cover" ? "bg-[#194a9a] text-white shadow-sm" : "text-slate-550 hover:text-slate-350"}`}
                      >
                        Quick View
                      </button>
                      <button 
                        onClick={() => setViewMode("pdf")}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all ${viewMode === "pdf" ? "bg-[#194a9a] text-white shadow-sm" : "text-slate-550 hover:text-slate-350"}`}
                      >
                        Interactive PDF Reader
                      </button>
                    </div>
                  ) : !loadingDetails ? (
                    <div className="text-xs text-slate-500 font-extrabold select-none">
                      {modalPages[activePageIndex]?.type === "pdf-page" 
                        ? `PDF PAGE PREVIEW (${modalPages[activePageIndex]?.pageNum} of ${modalPages[activePageIndex]?.totalPages})` 
                        : "IMAGE DETAIL PREVIEW"
                      }
                    </div>
                  ) : <div />}
                  
                  {!loadingDetails && modalPages[activePageIndex] && (
                    <motion.button 
                      onClick={() => openPDF(modalPages[activePageIndex].downloadUrl)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
                      whileTap={{ scale: 0.99 }}
                    >
                      <FaDownload className="text-xs" />
                      <span>
                        {modalPages[activePageIndex].type === "image" ? "Open / Download Image" : "Open / Download PDF"}
                      </span>
                    </motion.button>
                  )}
                </div>

                {/* Bottom Thumbnail Strip */}
                {!loadingDetails && modalPages.length > 1 && (
                  <div className="mt-5 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">
                      Pages ({activePageIndex + 1} of {modalPages.length})
                    </span>
                    <div className="flex gap-3 overflow-x-auto justify-start sm:justify-center py-2 px-1 scrollbar-thin">
                      {modalPages.map((page, idx) => (
                        <button
                          key={page.id}
                          onClick={() => handlePageChange(idx)}
                          className={`relative rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${activePageIndex === idx ? "border-amber-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                          {page.type === "image" || page.type === "pdf-page" ? (
                            <img 
                              src={page.url} 
                              alt={`Page ${idx + 1}`} 
                              className="w-10 h-14 object-cover" 
                            />
                          ) : page.thumbnail ? (
                            <img 
                              src={page.thumbnail} 
                              alt={`Page ${idx + 1}`} 
                              className="w-10 h-14 object-cover" 
                            />
                          ) : (
                            <div className="w-10 h-14 bg-white/5 border border-white/5 flex flex-col items-center justify-center text-slate-550 text-[8px] font-bold">
                              <FaFilePdf className="text-xs mb-1" />
                              <span>P.{idx + 1}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Fullscreen Interactive Overlay */}
                 <AnimatePresence>
                   {isFullscreen && (
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.25 }}
                       className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-6 select-none"
                     >
                       {/* Top Header & Toolbar */}
                       <motion.div 
                         initial={{ y: -30, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         exit={{ y: -30, opacity: 0 }}
                         transition={{ type: "spring", stiffness: 350, damping: 25 }}
                         className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10 pb-4 border-b border-white/5 w-full"
                       >
                         <h3 className="text-white font-extrabold text-lg truncate max-w-full sm:max-w-[55%]">
                           {selectedEventTitle}
                         </h3>
                         <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl">
                           <button
                             type="button"
                             onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                             className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                             title="Zoom In (+)"
                           >
                             <FaPlus className="text-xs" />
                           </button>
                           <span className="text-xs font-black text-slate-300 w-12 text-center">
                             {Math.round(zoom * 100)}%
                           </span>
                           <button
                             type="button"
                             onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                             className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                             title="Zoom Out (-)"
                           >
                             <FaMinus className="text-xs" />
                           </button>
                           <button
                             type="button"
                             onClick={() => { setZoom(1); setRotation(0); }}
                             className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black"
                             title="Reset View"
                           >
                             1:1
                           </button>
                           <div className="w-[1px] h-6 bg-white/10 mx-0.5" />
                           <button
                             type="button"
                             onClick={() => setRotation(prev => (prev + 90) % 360)}
                             className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                             title="Rotate (R)"
                           >
                             <FaRedo className="text-xs" />
                           </button>
                           <button
                             type="button"
                             onClick={() => setIsFullscreen(false)}
                             className="w-9 h-9 flex items-center justify-center rounded-xl text-rose-455 hover:text-white hover:bg-rose-500/20 transition-all"
                             title="Exit Fullscreen (Esc)"
                           >
                             <FaCompress className="text-xs" />
                           </button>
                         </div>
                       </motion.div>

                     {/* Zoomed Viewer Area (Slide Swipe fullscreen page swap) */}
                      <div className="relative flex-grow flex items-center justify-center overflow-hidden my-4 w-full min-h-[300px]">
                        {/* Floating Left Arrow */}
                        {activePageIndex > 0 && (
                          <button 
                            onClick={() => handlePageChange(activePageIndex - 1)}
                            className="absolute left-4 sm:left-6 w-12 h-12 sm:w-14 sm:h-14 bg-slate-900/80 border border-white/10 hover:border-amber-500 text-slate-350 hover:text-amber-500 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-30"
                            title="Previous Page"
                          >
                            <FaChevronLeft className="text-lg" />
                          </button>
                        )}
 
                        {/* Floating Right Arrow */}
                        {activePageIndex < modalPages.length - 1 && (
                          <button 
                            onClick={() => handlePageChange(activePageIndex + 1)}
                            className="absolute right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-slate-900/80 border border-white/10 hover:border-amber-500 text-slate-350 hover:text-amber-500 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-30"
                            title="Next Page"
                          >
                            <FaChevronRight className="text-lg" />
                          </button>
                        )}
 
                        <div className="w-full h-full flex items-center justify-center overflow-hidden relative min-h-[300px]">
                          <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                              key={activePageIndex}
                              custom={direction}
                              variants={{
                                enter: (direction) => ({
                                  x: direction > 0 ? "100%" : "-100%",
                                  opacity: 0
                                }),
                                center: {
                                  x: 0,
                                  opacity: 1
                                },
                                exit: (direction) => ({
                                  x: direction < 0 ? "100%" : "-100%",
                                  opacity: 0
                                })
                              }}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.25 }
                              }}
                              className="absolute inset-0 w-full h-full flex items-center justify-center p-4"
                            >
                              <div 
                                className="w-full h-full flex items-center justify-center overflow-auto scrollbar-thin select-none"
                                style={{ cursor: zoom > 1 ? "grab" : "default" }}
                              >
                                {modalPages[activePageIndex] ? (
                                  <img 
                                    src={modalPages[activePageIndex].url || modalPages[activePageIndex].thumbnail} 
                                    alt="Event Detail Fullscreen" 
                                    className="transition-transform duration-205 ease-out origin-center max-h-[75vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-white/5"
                                    style={{
                                      transform: `scale(${zoom}) rotate(${rotation}deg)`
                                    }}
                                  />
                                ) : (
                                  <span className="text-slate-500 text-sm">Page not available</span>
                                )}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 30, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="flex justify-between items-center text-[10px] text-slate-550 font-black pb-2 border-t border-white/5 pt-4"
                      >
                        <span className="hidden sm:inline">ESC / CLOSE TO EXIT</span>
                        <span className="text-amber-500 tracking-wider">
                          PAGE {activePageIndex + 1} OF {modalPages.length}
                        </span>
                        <span className="hidden sm:inline">USE ARROW KEYS OR CLICK TO BROWSE</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
 
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>

      </div>
    </Suspense>
  );
}
