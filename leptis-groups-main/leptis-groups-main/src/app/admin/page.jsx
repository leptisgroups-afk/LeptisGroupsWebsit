'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader';
import { 
    FaLock, FaUser, FaBuilding, FaRegFilePdf, FaEnvelope, 
    FaPhone, FaDatabase, FaCog, FaChartBar, FaSignOutAlt, 
    FaCalendarAlt, FaBriefcase, FaPaperPlane, FaEdit, FaCheck, 
    FaExclamationTriangle, FaTrash, FaPlus, FaEye, FaArrowRight, FaUpload, FaTimes,
    FaMapMarkerAlt, FaAward
} from 'react-icons/fa';
import { getApiUrl, getCleanImageUrl } from "@/data/config";
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from "@/context/SiteSettingsContext";

const isImageFile = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].split('#')[0];
  return /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanUrl);
};

export default function AdminDashboard() {
    const SETTINGS_URL = getApiUrl("/api/site-settings/");
    const { refreshSettings } = useSiteSettings();
    const APPLICATIONS_URL = getApiUrl("/api/career-applications/");
    const MESSAGES_URL = getApiUrl("/api/contact-messages/");
    const EVENTS_URL = getApiUrl("/api/events/");
    const BRAND_LOGOS_URL = getApiUrl("/api/brand-logos/");
    const PROJECTS_URL = getApiUrl("/api/projects/");
    const PROJECT_IMAGES_URL = getApiUrl("/api/project-images/");
    const TEAM_MEMBERS_URL = getApiUrl("/api/team-members/");
    const BRANCHES_URL = getApiUrl("/api/branches/");
    const MILESTONES_URL = getApiUrl("/api/timeline-milestones/");
    const VERTICALS_URL = getApiUrl("/api/business-verticals/");
    const STRENGTHS_URL = getApiUrl("/api/strengths/");
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [otpRequired, setOtpRequired] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [sessionKey, setSessionKey] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const getAuthHeaders = (extraHeaders = {}) => {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("leptis_admin_token");
        console.log("[DEBUG] getAuthHeaders - Token:", token ? `${token.substring(0, 8)}...` : "NONE");
        return {
            headers: {
                ...(token ? { "Authorization": `Token ${token}` } : {}),
                ...extraHeaders
            }
        };
    };

    const getCvUrlWithToken = (cvUrl) => {
        if (!cvUrl) return "";
        if (typeof window === "undefined") return cvUrl;
        const token = localStorage.getItem("leptis_admin_token");
        return token ? `${cvUrl}?token=${token}` : cvUrl;
    };

    // Navigation state
    const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "applications", "messages", "events", "settings", "brands", "projects", "team", "branches"

    // Data states
    const [settings, setSettings] = useState(null);
    const [applications, setApplications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [events, setEvents] = useState([]);
    const [brandLogos, setBrandLogos] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [newBranchName, setNewBranchName] = useState("");
    const [editingBranchId, setEditingBranchId] = useState(null);
    const [editingBranchName, setEditingBranchName] = useState("");
    const [branchSubmitStatus, setBranchSubmitStatus] = useState("");

    // Milestones CRUD states
    const [milestones, setMilestones] = useState([]);
    const [newMilestone, setNewMilestone] = useState({ year: "", title: "", description: "", order: 0 });
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);
    const [editingMilestoneData, setEditingMilestoneData] = useState({ year: "", title: "", description: "", order: 0 });
    const [milestoneSubmitStatus, setMilestoneSubmitStatus] = useState("");

    // Verticals CRUD states
    const [verticals, setVerticals] = useState([]);
    const [newVertical, setNewVertical] = useState({ title: "", description: "", icon_class: "FaStore", order: 0 });
    const [editingVerticalId, setEditingVerticalId] = useState(null);
    const [editingVerticalData, setEditingVerticalData] = useState({ title: "", description: "", icon_class: "FaStore", order: 0 });
    const [verticalSubmitStatus, setVerticalSubmitStatus] = useState("");

    // Strengths CRUD states
    const [strengths, setStrengths] = useState([]);
    const [newStrength, setNewStrength] = useState({ title: "", description: "", icon_class: "FaGlobe", bg_color: "bg-amber-500", order: 0 });
    const [editingStrengthId, setEditingStrengthId] = useState(null);
    const [editingStrengthData, setEditingStrengthData] = useState({ title: "", description: "", icon_class: "FaGlobe", bg_color: "bg-amber-500", order: 0 });
    const [strengthSubmitStatus, setStrengthSubmitStatus] = useState("");

    // Firewall states
    const BLOCKED_IPS_URL = getApiUrl("/api/blocked-ips/");
    const [blockedIps, setBlockedIps] = useState([]);
    const [newIp, setNewIp] = useState("");
    const [blockReason, setBlockReason] = useState("");
    const [clientIp, setClientIp] = useState("");
    const [securityStatus, setSecurityStatus] = useState("");

    // Loading & Operation states
    const [loadingData, setLoadingData] = useState(false);
    const [settingsForm, setSettingsForm] = useState({});
    const [updateStatus, setUpdateStatus] = useState("");
    const [updateStatusType, setUpdateStatusType] = useState("");

    // Image Uploads State
    const [settingImages, setSettingImages] = useState({
        hero_bg: null,
        about_team_img: null,
        home_about_img: null,
        consult_img: null,
        careers_bg: null,
        brands_bg: null,
        founder_image: null,
        site_logo: null,
        share_image: null,
    });

    // Image Input Refs (to clear them)
    const fileRefs = {
        hero_bg: useRef(null),
        about_team_img: useRef(null),
        home_about_img: useRef(null),
        consult_img: useRef(null),
        careers_bg: useRef(null),
        brands_bg: useRef(null),
        founder_image: useRef(null),
        site_logo: useRef(null),
        share_image: useRef(null),
    };

    // Offers CRUD State
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        category: "dubai_lassi_home",
        expire_date: "",
        pdfs: [],
        thumbnail: null
    });
    const [eventSubmitStatus, setEventSubmitStatus] = useState("");
    const [eventSubmitStatusType, setEventSubmitStatusType] = useState("");
    const eventPdfInputRef = useRef(null);
    const eventThumbnailInputRef = useRef(null);
    const [eventThumbnailErrors, setEventThumbnailErrors] = useState({});

    // Edit Offer State
    const [editingEventId, setEditingEventId] = useState(null);
    const [editingEventData, setEditingEventData] = useState({
        title: "",
        category: "",
        expire_date: ""
    });

    // Create Offer Date/Time split states
    const [newEventDate, setNewEventDate] = useState("");
    const [newEventHour, setNewEventHour] = useState("23");
    const [newEventMinute, setNewEventMinute] = useState("59");

    // Edit Offer Date/Time split states
    const [editingEventDate, setEditingEventDate] = useState("");
    const [editingEventHour, setEditingEventHour] = useState("23");
    const [editingEventMinute, setEditingEventMinute] = useState("59");

    // Brand Logos CRUD State
    const [newBrand, setNewBrand] = useState({ name: "", image: null });
    const [brandSubmitStatus, setBrandSubmitStatus] = useState("");
    const brandFileInputRef = useRef(null);

    // Projects CRUD State
    const [newProject, setNewProject] = useState({ title: "", category: "dubai_lassi_home", main_image: null });
    const [projectSubmitStatus, setProjectSubmitStatus] = useState("");
    const projectFileInputRef = useRef(null);

    // Expanded Project & Gallery State
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [newGalleryImage, setNewGalleryImage] = useState({ title: "", image: null });
    const [gallerySubmitStatus, setGallerySubmitStatus] = useState("");
    const galleryFileInputRef = useRef(null);
    const [editingGalleryImageId, setEditingGalleryImageId] = useState(null);
    const [editingGalleryImageTitle, setEditingGalleryImageTitle] = useState("");

    // Team Members CRUD State
    const [newTeamMember, setNewTeamMember] = useState({
        name: "",
        position: "Our Winning Team",
        image: null,
        facebook_url: "#",
        twitter_url: "#",
        youtube_url: "#"
    });
    const [teamMemberSubmitStatus, setTeamMemberSubmitStatus] = useState("");
    const teamMemberFileInputRef = useRef(null);

    // Edit Team Member State
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [editingTeamData, setEditingTeamData] = useState({
        name: "",
        position: "",
        facebook_url: "",
        twitter_url: "",
        youtube_url: ""
    });

    // Track current active image specs (size and resolution) from the server
    const [currentImageSpecs, setCurrentImageSpecs] = useState({});

    const updateImageSpecs = async (name, url) => {
        if (!url) return;
        try {
            // Get content-length first via HEAD
            let sizeStr = "";
            try {
                const response = await fetch(url, { method: "HEAD" });
                const bytes = response.headers.get("content-length");
                if (bytes) {
                    const kb = parseInt(bytes) / 1024;
                    sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(0)} KB`;
                }
            } catch (headErr) {
                console.warn("HEAD request failed for size checks, falling back to GET...", headErr);
            }

            // Load the image to get width and height
            const img = new Image();
            img.onload = () => {
                let finalSize = sizeStr;
                if (!finalSize) {
                    // Fallback to GET to get size if HEAD failed or lacked Content-Length
                    fetch(url)
                        .then(res => res.blob())
                        .then(blob => {
                            const kb = blob.size / 1024;
                            finalSize = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(0)} KB`;
                            setCurrentImageSpecs(prev => ({
                                ...prev,
                                [name]: {
                                    size: finalSize,
                                    width: img.width,
                                    height: img.height
                                }
                            }));
                        })
                        .catch(() => {
                            setCurrentImageSpecs(prev => ({
                                ...prev,
                                [name]: {
                                    size: "Unknown",
                                    width: img.width,
                                    height: img.height
                                }
                            }));
                        });
                } else {
                    setCurrentImageSpecs(prev => ({
                        ...prev,
                        [name]: {
                            size: finalSize,
                            width: img.width,
                            height: img.height
                        }
                    }));
                }
            };
            img.src = url;
        } catch (err) {
            console.error("Failed to get image specs for " + name, err);
        }
    };

    // Track selected file specifications (size, resolution, file name)
    const [selectedImageSpecs, setSelectedImageSpecs] = useState({});

    const handleSelectedFileSpecs = (name, file) => {
        if (!file) {
            setSelectedImageSpecs(prev => ({ ...prev, [name]: null }));
            return;
        }
        
        // Non-image files (e.g. PDFs)
        if (!file.type.startsWith('image/')) {
            const sizeInKb = file.size / 1024;
            const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb.toFixed(0)} KB`;
            setSelectedImageSpecs(prev => ({
                ...prev,
                [name]: {
                    size: file.size,
                    formattedSize,
                    name: file.name,
                    isImage: false
                }
            }));
            return;
        }

        // Image files - load image to get width and height
        const img = new Image();
        img.onload = () => {
            const sizeInKb = file.size / 1024;
            const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb.toFixed(0)} KB`;
            setSelectedImageSpecs(prev => ({
                ...prev,
                [name]: {
                    size: file.size,
                    formattedSize,
                    width: img.width,
                    height: img.height,
                    name: file.name,
                    isImage: true
                }
            }));
        };
        img.src = URL.createObjectURL(file);
    };

    // Render specifications and size warning for selected files dynamically
    const renderSelectedImageSpecs = (name, recommendedMaxKb) => {
        const spec = selectedImageSpecs[name];
        if (!spec) return null;

        const sizeInKb = spec.size / 1024;
        const isTooLarge = sizeInKb > recommendedMaxKb;

        return (
            <div className="mt-2.5 space-y-1.5 text-left">
                <div className="text-[10px] font-black text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-0.5 shadow-inner">
                    <span className="truncate">File: <span className="text-blue-400 font-bold">{spec.name}</span></span>
                    <span>Size: <span className="font-bold">{spec.formattedSize}</span></span>
                    {spec.isImage && (
                        <span>Resolution: <span className="font-bold text-amber-500">{spec.width} x {spec.height} px</span></span>
                    )}
                </div>
                {isTooLarge ? (
                    <div className="p-2 bg-rose-950/30 border border-rose-900/50 rounded-xl text-[10px] text-rose-400 font-bold flex items-start gap-1.5 animate-pulse">
                        <span>⚠️</span>
                        <span>File exceeds recommended max limit of {recommendedMaxKb} KB. Page performance might be impacted.</span>
                    </div>
                ) : (
                    <div className="p-1.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <span>✅</span>
                        <span>File size is within recommended limits.</span>
                    </div>
                )}
            </div>
        );
    };

    // Check login state on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("leptis_admin_token");
        if (savedToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            localStorage.removeItem("leptis_admin_logged");
        }
    }, []);

    // Fetch data when logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchData();
        }
    }, [isLoggedIn]);

    // Automatically set default category to first branch when loaded
    useEffect(() => {
        if (branches.length > 0) {
            if (!newEvent.category) {
                setNewEvent(prev => ({ ...prev, category: branches[0].key }));
            }
            if (!newProject.category) {
                setNewProject(prev => ({ ...prev, category: branches[0].key }));
            }
        }
    }, [branches, newEvent.category, newProject.category]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const getOrFallback = async (url, fallback) => {
                try {
                    const res = await axios.get(url, getAuthHeaders());
                    return res.data;
                } catch (e) {
                    console.error(`Failed to fetch ${url}`, e);
                    return fallback;
                }
            };

            const [settRes, appRes, msgRes, evRes, brandRes, projRes, teamRes, branchRes, blockedRes, milestonesRes, verticalsRes, strengthsRes] = await Promise.all([
                getOrFallback(SETTINGS_URL, null),
                getOrFallback(APPLICATIONS_URL, []),
                getOrFallback(MESSAGES_URL, []),
                getOrFallback(EVENTS_URL, []),
                getOrFallback(BRAND_LOGOS_URL, []),
                getOrFallback(PROJECTS_URL, []),
                getOrFallback(TEAM_MEMBERS_URL, []),
                getOrFallback(BRANCHES_URL, []),
                getOrFallback(BLOCKED_IPS_URL, []),
                getOrFallback(MILESTONES_URL, []),
                getOrFallback(VERTICALS_URL, []),
                getOrFallback(STRENGTHS_URL, [])
            ]);

            if (settRes) {
                setSettings(settRes);
                setSettingsForm(settRes);
                
                // Fetch sizes of current active images
                updateImageSpecs("hero_bg", getCleanImageUrl(settRes.hero_bg_url) || "/ship-bg.jpg");
                updateImageSpecs("about_team_img", getCleanImageUrl(settRes.about_team_img_url) || "/team.jpg");
                updateImageSpecs("home_about_img", getCleanImageUrl(settRes.home_about_img_url) || "/homeabout.jpg");
                updateImageSpecs("consult_img", getCleanImageUrl(settRes.consult_img_url) || "/consultbg.png");
                updateImageSpecs("careers_bg", getCleanImageUrl(settRes.careers_bg_url) || "/ship-bg.jpg");
                updateImageSpecs("brands_bg", getCleanImageUrl(settRes.brands_bg_url) || "/ship-bg.jpg");
                updateImageSpecs("founder_image", getCleanImageUrl(settRes.founder_image_url) || "");
                updateImageSpecs("site_logo", getCleanImageUrl(settRes.site_logo_url) || "/logo.png");
                updateImageSpecs("share_image", getCleanImageUrl(settRes.share_image_url) || "/logo.png");
            }
            setApplications(appRes);
            setMessages(msgRes);
            setEvents(evRes);
            setBrandLogos(brandRes);
            setProjects(projRes);
            setTeamMembers(teamRes);
            setBranches(branchRes);
            setBlockedIps(blockedRes);
            setMilestones(milestonesRes);
            setVerticals(verticalsRes);
            setStrengths(strengthsRes);

            // Fetch client IP
            try {
                const ipRes = await axios.get(getApiUrl("/api/check/"));
                if (ipRes.data && ipRes.data.client_ip) {
                    setClientIp(ipRes.data.client_ip);
                }
            } catch (err) {
                console.error("Failed to fetch client IP address:", err);
            }
        } catch (err) {
            console.error("Error loading admin data:", err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        try {
            const response = await axios.post(getApiUrl("/api/login/"), {
                username: loginForm.username,
                password: loginForm.password
            });
            
            if (response.data.otp_required) {
                setOtpRequired(true);
                setSessionKey(response.data.session_key);
                setLoginError("");
                return;
            }

            const { token } = response.data;
            if (token) {
                localStorage.setItem("leptis_admin_token", token);
                localStorage.setItem("leptis_admin_logged", "true");
                setIsLoggedIn(true);
                setLoginError("");
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("leptis_auth_change"));
                }
            } else {
                setLoginError("Unable to retrieve authentication token.");
            }
        } catch (err) {
            console.error("Login failed:", err);
            if (err.response && err.response.data) {
                const errors = err.response.data;
                if (errors.non_field_errors) {
                    setLoginError(errors.non_field_errors.join(" "));
                } else if (errors.detail) {
                    setLoginError(errors.detail);
                } else {
                    setLoginError("Invalid username or password.");
                }
            } else {
                setLoginError("Connection to authentication server failed.");
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoginError("");
        setIsVerifyingOtp(true);
        try {
            const response = await axios.post(getApiUrl("/api/verify-otp/"), {
                session_key: sessionKey,
                otp: otpCode
            });
            const { token } = response.data;
            if (token) {
                localStorage.setItem("leptis_admin_token", token);
                localStorage.setItem("leptis_admin_logged", "true");
                setIsLoggedIn(true);
                setLoginError("");
                setOtpRequired(false);
                setOtpCode("");
                setSessionKey("");
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("leptis_auth_change"));
                }
            } else {
                setLoginError("Unable to retrieve authentication token.");
            }
        } catch (err) {
            console.error("OTP verification failed:", err);
            if (err.response && err.response.data) {
                const errors = err.response.data;
                if (errors.detail) {
                    setLoginError(errors.detail);
                } else if (errors.message) {
                    setLoginError(errors.message);
                } else {
                    setLoginError("OTP verification failed.");
                }
            } else {
                setLoginError("Connection to authentication server failed.");
            }
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem("leptis_admin_logged");
        localStorage.removeItem("leptis_admin_token");
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("leptis_auth_change"));
        }
    };

    // --- FIREWALL SECURITY CONTROLS ---
    const handleBlockIp = async (e) => {
        e.preventDefault();
        setSecurityStatus("Blocking IP...");
        try {
            const res = await axios.post(BLOCKED_IPS_URL, {
                ip_address: newIp,
                reason: blockReason || "Manual block"
            }, getAuthHeaders());
            
            setBlockedIps(prev => [res.data, ...prev]);
            setNewIp("");
            setBlockReason("");
            setSecurityStatus("IP blocked successfully.");
        } catch (err) {
            console.error("Failed to block IP:", err);
            const errMsg = err.response?.data?.detail || err.response?.data?.ip_address?.[0] || "Failed to block IP.";
            setSecurityStatus(`Error: ${errMsg}`);
        }
    };

    const handleUnblockIp = async (id) => {
        setSecurityStatus("Unblocking IP...");
        try {
            await axios.delete(`${BLOCKED_IPS_URL}${id}/`, getAuthHeaders());
            setBlockedIps(prev => prev.filter(item => item.id !== id));
            setSecurityStatus("IP unblocked successfully.");
        } catch (err) {
            console.error("Failed to unblock IP:", err);
            const errMsg = err.response?.data?.detail || "Failed to unblock IP.";
            setSecurityStatus(`Error: ${errMsg}`);
        }
    };

    // --- SETTINGS CONTROLS ---
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettingsForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setSettingImages(prev => ({
                ...prev,
                [name]: files[0]
            }));
            // Generate a local object URL for instant previewing
            const previewUrl = URL.createObjectURL(files[0]);
            setSettingsForm(prev => ({
                ...prev,
                [`${name}_url`]: previewUrl
            }));
            
            // Extract resolution and size specs
            handleSelectedFileSpecs(name, files[0]);
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setUpdateStatus("Saving settings...");
        setUpdateStatusType("info");

        const data = new FormData();
        // Append all text settings, avoiding urls or file placeholders
        Object.keys(settingsForm).forEach(key => {
            if (
                key !== 'hero_bg_url' &&
                key !== 'about_team_img_url' &&
                key !== 'home_about_img_url' &&
                key !== 'consult_img_url' &&
                key !== 'careers_bg_url' &&
                key !== 'brands_bg_url' &&
                key !== 'founder_image_url' &&
                key !== 'site_logo_url' &&
                key !== 'share_image_url' &&
                key !== 'hero_bg' && 
                key !== 'about_team_img' && 
                key !== 'home_about_img' && 
                key !== 'consult_img' &&
                key !== 'careers_bg' &&
                key !== 'brands_bg' &&
                key !== 'founder_image' &&
                key !== 'site_logo' &&
                key !== 'share_image'
            ) {
                data.append(key, settingsForm[key] !== null ? settingsForm[key] : "");
            }
        });

        // Append any new uploaded files
        Object.keys(settingImages).forEach(key => {
            if (settingImages[key]) {
                data.append(key, settingImages[key]);
            }
        });

        try {
            const res = await axios.post(SETTINGS_URL, data, getAuthHeaders({ "Content-Type": "multipart/form-data" }));
            setSettings(res.data);
            setSettingsForm(res.data);
            
            // Re-fetch sizes and resolution of newly saved images
            updateImageSpecs("hero_bg", getCleanImageUrl(res.data.hero_bg_url) || "/ship-bg.jpg");
            updateImageSpecs("about_team_img", getCleanImageUrl(res.data.about_team_img_url) || "/team.jpg");
            updateImageSpecs("home_about_img", getCleanImageUrl(res.data.home_about_img_url) || "/homeabout.jpg");
            updateImageSpecs("consult_img", getCleanImageUrl(res.data.consult_img_url) || "/consultbg.png");
            updateImageSpecs("careers_bg", getCleanImageUrl(res.data.careers_bg_url) || "/ship-bg.jpg");
            updateImageSpecs("brands_bg", getCleanImageUrl(res.data.brands_bg_url) || "/ship-bg.jpg");
            updateImageSpecs("founder_image", getCleanImageUrl(res.data.founder_image_url) || "");
            updateImageSpecs("site_logo", getCleanImageUrl(res.data.site_logo_url) || "/logo.png");
            updateImageSpecs("share_image", getCleanImageUrl(res.data.share_image_url) || "/logo.png");
            
            setSelectedImageSpecs({});
            setSettingImages({
                hero_bg: null,
                about_team_img: null,
                home_about_img: null,
                consult_img: null,
                careers_bg: null,
                brands_bg: null,
                founder_image: null,
                site_logo: null,
                share_image: null,
            });
            Object.keys(fileRefs).forEach(key => {
                if (fileRefs[key].current) fileRefs[key].current.value = "";
            });

            setUpdateStatus("Settings and images updated successfully!");
            setUpdateStatusType("success");
            try {
                refreshSettings();
            } catch (refreshErr) {
                console.error("Failed to refresh global settings after update:", refreshErr);
            }
            setTimeout(() => {
                setUpdateStatus("");
                setUpdateStatusType("");
            }, 6000);
        } catch (err) {
            console.error("Settings update error:", err);
            setUpdateStatus("Failed to save settings. Check details and try again.");
            setUpdateStatusType("error");
            setTimeout(() => {
                setUpdateStatus("");
                setUpdateStatusType("");
            }, 6000);
        }
    };

    // --- OFFERS CRUD CONTROLS ---
    const handleNewEventChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setNewEvent(prev => ({
                ...prev,
                pdfs: Array.from(files)
            }));
        } else {
            setNewEvent(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNewEventThumbnailChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            setNewEvent(prev => ({
                ...prev,
                thumbnail: files[0]
            }));
            handleSelectedFileSpecs("event", files[0]);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setEventSubmitStatus("Creating event...");
        setEventSubmitStatusType("info");

        if (newEvent.pdfs.length === 0) {
            setEventSubmitStatus("Error: Please select at least one PDF file.");
            setEventSubmitStatusType("error");
            return;
        }

        const data = new FormData();
        data.append("title", newEvent.title);
        data.append("category", newEvent.category);
        if (newEventDate) {
            const localDate = new Date(`${newEventDate}T${newEventHour}:${newEventMinute}:05`);
            if (!isNaN(localDate.getTime())) {
                data.append("expire_date", localDate.toISOString());
            }
        }
        
        newEvent.pdfs.forEach(file => {
            data.append("pdfs", file);
        });

        if (newEvent.thumbnail) {
            data.append("thumbnail", newEvent.thumbnail);
        }

        try {
            console.log("[DEBUG] Creating event with title:", newEvent.title);
            const headersConfig = getAuthHeaders({ "Content-Type": "multipart/form-data" });
            console.log("[DEBUG] Create Headers Config:", headersConfig);
            const res = await axios.post(EVENTS_URL, data, headersConfig);
            console.log("[DEBUG] Create Success:", res.data);

            setEventSubmitStatus("Event created and activated successfully!");
            setEventSubmitStatusType("success");

            setNewEvent({
                title: "",
                category: "dubai_lassi_home",
                expire_date: "",
                pdfs: [],
                thumbnail: null
            });
            setNewEventDate("");
            setNewEventHour("23");
            setNewEventMinute("59");

            if (eventPdfInputRef.current) eventPdfInputRef.current.value = "";
            if (eventThumbnailInputRef.current) eventThumbnailInputRef.current.value = "";
            setShowAddEventForm(false);
            
            setSelectedImageSpecs(prev => ({ ...prev, event: null }));
            fetchData();
            setTimeout(() => {
                setEventSubmitStatus("");
                setEventSubmitStatusType("");
            }, 5000);
        } catch (err) {
            console.error("[DEBUG] Create event error:", err);
            const errMsg = err.response && err.response.data 
                ? JSON.stringify(err.response.data) 
                : err.message;
            setEventSubmitStatus(`Failed to create event. Error: ${errMsg}`);
            setEventSubmitStatusType("error");
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            console.log("[DEBUG] Deleting event ID:", eventId);
            const headersConfig = getAuthHeaders();
            console.log("[DEBUG] Delete Headers Config:", headersConfig);
            const res = await axios.delete(`${EVENTS_URL}${eventId}/`, headersConfig);
            console.log("[DEBUG] Delete Success:", res.data);
            fetchData();
        } catch (err) {
            console.error("[DEBUG] Delete event error:", err);
            const errMsg = err.response && err.response.data 
                ? JSON.stringify(err.response.data) 
                : err.message;
            alert(`Failed to delete event. Error: ${errMsg}`);
        }
    };

    const handleStartEditEvent = (event) => {
        setEditingEventId(event.id);
        let dateVal = "";
        let hourVal = "23";
        let minVal = "59";
        if (event.expire_date) {
            const date = new Date(event.expire_date);
            if (!isNaN(date.getTime())) {
                const pad = (num) => String(num).padStart(2, '0');
                dateVal = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                hourVal = pad(date.getHours());
                minVal = pad(date.getMinutes());
            }
        }
        setEditingEventData({
            title: event.title,
            category: event.category,
            expire_date: event.expire_date || ""
        });
        setEditingEventDate(dateVal);
        setEditingEventHour(hourVal);
        setEditingEventMinute(minVal);
    };

    const handleCancelEditEvent = () => {
        setEditingEventId(null);
    };

    const handleSaveEditEvent = async (eventId) => {
        let expireDateTime = null;
        if (editingEventDate) {
            const localDate = new Date(`${editingEventDate}T${editingEventHour}:${editingEventMinute}:00`);
            if (!isNaN(localDate.getTime())) {
                expireDateTime = localDate.toISOString();
            }
        }
        try {
            await axios.patch(`${EVENTS_URL}${eventId}/`, {
                ...editingEventData,
                expire_date: expireDateTime
            }, getAuthHeaders());
            setEditingEventId(null);
            fetchData();
        } catch (err) {
            console.error("Edit event error:", err);
            alert("Failed to save event changes.");
        }
    };

    // --- BRAND LOGOS CRUD ---
    const handleBrandChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setNewBrand(prev => ({
                ...prev,
                image: files[0]
            }));
            handleSelectedFileSpecs("brand", files[0]);
        } else {
            setNewBrand(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreateBrand = async (e) => {
        e.preventDefault();
        if (!newBrand.image) {
            setBrandSubmitStatus("Error: Please select a brand logo image.");
            return;
        }
        setBrandSubmitStatus("Uploading brand logo...");

        const data = new FormData();
        data.append("name", newBrand.name);
        data.append("image", newBrand.image);

        try {
            await axios.post(BRAND_LOGOS_URL, data, getAuthHeaders({ "Content-Type": "multipart/form-data" }));
            setBrandSubmitStatus("Brand logo added successfully!");
            setNewBrand({ name: "", image: null });
            if (brandFileInputRef.current) brandFileInputRef.current.value = "";
            setSelectedImageSpecs(prev => ({ ...prev, brand: null }));
            fetchData();
            setTimeout(() => setBrandSubmitStatus(""), 5000);
        } catch (err) {
            console.error("Create brand logo error:", err);
            setBrandSubmitStatus("Failed to upload brand logo.");
        }
    };

    const handleDeleteBrand = async (brandId) => {
        if (!confirm("Are you sure you want to delete this brand logo?")) return;
        try {
            await axios.delete(`${BRAND_LOGOS_URL}${brandId}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete brand logo error:", err);
            alert("Failed to delete brand logo.");
        }
    };

    // --- BRANCHES CRUD CONTROLS ---
    const handleCreateBranch = async (e) => {
        e.preventDefault();
        if (!newBranchName.trim()) {
            setBranchSubmitStatus("Error: Branch name cannot be empty.");
            return;
        }
        setBranchSubmitStatus("Creating branch...");

        try {
            await axios.post(BRANCHES_URL, { name: newBranchName.trim() }, getAuthHeaders());
            setBranchSubmitStatus("Branch created successfully!");
            setNewBranchName("");
            fetchData();
            setTimeout(() => setBranchSubmitStatus(""), 5000);
        } catch (err) {
            console.error("Create branch error:", err);
            setBranchSubmitStatus("Failed to create branch. Ensure the name is unique.");
        }
    };

    const handleDeleteBranch = async (branchId) => {
        if (!confirm("Are you sure you want to delete this branch? Existing projects and events with this branch will still display their stored key name, but you won't be able to select this branch for new items.")) return;
        try {
            await axios.delete(`${BRANCHES_URL}${branchId}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete branch error:", err);
            alert("Failed to delete branch.");
        }
    };

    const handleStartEditBranch = (branch) => {
        setEditingBranchId(branch.id);
        setEditingBranchName(branch.name);
    };

    const handleCancelEditBranch = () => {
        setEditingBranchId(null);
        setEditingBranchName("");
    };

    const handleSaveEditBranch = async (branchId) => {
        if (!editingBranchName.trim()) {
            alert("Branch name cannot be empty.");
            return;
        }
        try {
            await axios.patch(`${BRANCHES_URL}${branchId}/`, { name: editingBranchName.trim() }, getAuthHeaders());
            setEditingBranchId(null);
            setEditingBranchName("");
            fetchData();
        } catch (err) {
            console.error("Edit branch error:", err);
            alert("Failed to update branch name. Ensure it is unique.");
        }
    };

    // --- PROJECTS CRUD ---
    const handleProjectChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setNewProject(prev => ({
                ...prev,
                main_image: files[0]
            }));
            handleSelectedFileSpecs("project", files[0]);
        } else {
            setNewProject(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProject.main_image) {
            setProjectSubmitStatus("Error: Please select a main project image.");
            return;
        }
        setProjectSubmitStatus("Creating project...");

        const data = new FormData();
        data.append("title", newProject.title);
        data.append("category", newProject.category || "dubai_lassi_home");
        data.append("main_image", newProject.main_image);

        try {
            await axios.post(PROJECTS_URL, data, getAuthHeaders({ "Content-Type": "multipart/form-data" }));
            setProjectSubmitStatus("Project created successfully!");
            setNewProject({ title: "", category: "dubai_lassi_home", main_image: null });
            if (projectFileInputRef.current) projectFileInputRef.current.value = "";
            setSelectedImageSpecs(prev => ({ ...prev, project: null }));
            fetchData();
            setTimeout(() => setProjectSubmitStatus(""), 5000);
        } catch (err) {
            console.error("Create project error:", err);
            setProjectSubmitStatus("Failed to create project.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!confirm("Are you sure you want to delete this project? All associated gallery images will be deleted too.")) return;
        try {
            await axios.delete(`${PROJECTS_URL}${projectId}/`, getAuthHeaders());
            if (expandedProjectId === projectId) {
                setExpandedProjectId(null);
            }
            fetchData();
        } catch (err) {
            console.error("Delete project error:", err);
            alert("Failed to delete project.");
        }
    };

    // --- PROJECT GALLERY CRUD ---
    const handleGalleryImageChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setNewGalleryImage(prev => ({
                ...prev,
                image: files[0]
            }));
            handleSelectedFileSpecs("gallery", files[0]);
        } else {
            setNewGalleryImage(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddGalleryImage = async (e) => {
        e.preventDefault();
        if (!expandedProjectId) return;
        if (!newGalleryImage.image) {
            setGallerySubmitStatus("Error: Please select a gallery image.");
            return;
        }
        setGallerySubmitStatus("Adding gallery image...");

        const data = new FormData();
        data.append("project", expandedProjectId);
        data.append("title", newGalleryImage.title);
        data.append("image", newGalleryImage.image);

        try {
            await axios.post(PROJECT_IMAGES_URL, data, getAuthHeaders({ "Content-Type": "multipart/form-data" }));
            setGallerySubmitStatus("Gallery image added successfully!");
            setNewGalleryImage({ title: "", image: null });
            if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
            setSelectedImageSpecs(prev => ({ ...prev, gallery: null }));
            fetchData();
            setTimeout(() => setGallerySubmitStatus(""), 5000);
        } catch (err) {
            console.error("Add gallery image error:", err);
            setGallerySubmitStatus("Failed to add gallery image.");
        }
    };

    const handleDeleteGalleryImage = async (imageId) => {
        if (!confirm("Are you sure you want to delete this gallery image?")) return;
        try {
            await axios.delete(`${PROJECT_IMAGES_URL}${imageId}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete gallery image error:", err);
            alert("Failed to delete gallery image.");
        }
    };

    const handleStartEditGalleryImage = (img) => {
        setEditingGalleryImageId(img.id);
        setEditingGalleryImageTitle(img.title || "");
    };

    const handleCancelEditGalleryImage = () => {
        setEditingGalleryImageId(null);
        setEditingGalleryImageTitle("");
    };

    const handleSaveEditGalleryImage = async (imageId) => {
        try {
            setGallerySubmitStatus("Saving image title...");
            await axios.patch(`${PROJECT_IMAGES_URL}${imageId}/`, {
                title: editingGalleryImageTitle
            }, getAuthHeaders());
            setGallerySubmitStatus("Image title updated successfully!");
            setEditingGalleryImageId(null);
            setEditingGalleryImageTitle("");
            fetchData();
            setTimeout(() => setGallerySubmitStatus(""), 4000);
        } catch (err) {
            console.error("Edit gallery image error:", err);
            setGallerySubmitStatus("Failed to update image title.");
            setTimeout(() => setGallerySubmitStatus(""), 4000);
        }
    };

    // --- TEAM MEMBERS CRUD ---
    const handleTeamMemberChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setNewTeamMember(prev => ({
                ...prev,
                image: files[0]
            }));
            handleSelectedFileSpecs("team_member", files[0]);
        } else {
            setNewTeamMember(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreateTeamMember = async (e) => {
        e.preventDefault();
        if (!newTeamMember.image) {
            setTeamMemberSubmitStatus("Error: Please select a team member image.");
            return;
        }
        setTeamMemberSubmitStatus("Creating team member...");

        const data = new FormData();
        data.append("name", newTeamMember.name);
        data.append("position", newTeamMember.position);
        data.append("image", newTeamMember.image);
        data.append("facebook_url", newTeamMember.facebook_url);
        data.append("twitter_url", newTeamMember.twitter_url);
        data.append("youtube_url", newTeamMember.youtube_url);

        try {
            await axios.post(TEAM_MEMBERS_URL, data, getAuthHeaders({ "Content-Type": "multipart/form-data" }));
            setTeamMemberSubmitStatus("Team member added successfully!");
            setNewTeamMember({ name: "", position: "Our Winning Team", image: null, facebook_url: "#", twitter_url: "#", youtube_url: "#" });
            if (teamMemberFileInputRef.current) teamMemberFileInputRef.current.value = "";
            setSelectedImageSpecs(prev => ({ ...prev, team_member: null }));
            fetchData();
            setTimeout(() => setTeamMemberSubmitStatus(""), 5000);
        } catch (err) {
            console.error("Create team member error:", err);
            setTeamMemberSubmitStatus("Failed to add team member.");
        }
    };

    const handleDeleteTeamMember = async (teamId) => {
        if (!confirm("Are you sure you want to delete this team member?")) return;
        try {
            await axios.delete(`${TEAM_MEMBERS_URL}${teamId}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete team member error:", err);
            alert("Failed to delete team member.");
        }
    };

    const handleStartEditTeam = (member) => {
        setEditingTeamId(member.id);
        setEditingTeamData({
            name: member.name,
            position: member.position,
            facebook_url: member.facebook_url || "#",
            twitter_url: member.twitter_url || "#",
            youtube_url: member.youtube_url || "#"
        });
    };

    const handleCancelEditTeam = () => {
        setEditingTeamId(null);
    };

    const handleSaveEditTeam = async (teamId) => {
        try {
            await axios.patch(`${TEAM_MEMBERS_URL}${teamId}/`, editingTeamData, getAuthHeaders());
            setEditingTeamId(null);
            fetchData();
        } catch (err) {
            console.error("Edit team member error:", err);
            alert("Failed to save team member changes.");
        }
    };

    // --- TIMELINE MILESTONES CRUD HANDLERS ---
    const handleMilestoneChange = (e) => {
        const { name, value } = e.target;
        setNewMilestone(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateMilestone = async (e) => {
        e.preventDefault();
        setMilestoneSubmitStatus("Adding milestone...");
        try {
            await axios.post(MILESTONES_URL, newMilestone, getAuthHeaders());
            setMilestoneSubmitStatus("Milestone added successfully!");
            setNewMilestone({ year: "", title: "", description: "", order: 0 });
            fetchData();
            setTimeout(() => setMilestoneSubmitStatus(""), 4000);
        } catch (err) {
            console.error("Create milestone error:", err);
            setMilestoneSubmitStatus("Failed to add milestone.");
        }
    };

    const handleDeleteMilestone = async (id) => {
        if (!confirm("Are you sure you want to delete this milestone?")) return;
        try {
            await axios.delete(`${MILESTONES_URL}${id}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete milestone error:", err);
            alert("Failed to delete milestone.");
        }
    };

    const handleStartEditMilestone = (m) => {
        setEditingMilestoneId(m.id);
        setEditingMilestoneData({
            year: m.year,
            title: m.title,
            description: m.description,
            order: m.order
        });
    };

    const handleSaveEditMilestone = async (id) => {
        try {
            await axios.put(`${MILESTONES_URL}${id}/`, editingMilestoneData, getAuthHeaders());
            setEditingMilestoneId(null);
            fetchData();
        } catch (err) {
            console.error("Edit milestone error:", err);
            alert("Failed to save milestone changes.");
        }
    };

    // --- BUSINESS VERTICALS CRUD HANDLERS ---
    const handleVerticalChange = (e) => {
        const { name, value } = e.target;
        setNewVertical(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateVertical = async (e) => {
        e.preventDefault();
        setVerticalSubmitStatus("Adding vertical...");
        try {
            await axios.post(VERTICALS_URL, newVertical, getAuthHeaders());
            setVerticalSubmitStatus("Vertical added successfully!");
            setNewVertical({ title: "", description: "", icon_class: "FaStore", order: 0 });
            fetchData();
            setTimeout(() => setVerticalSubmitStatus(""), 4000);
        } catch (err) {
            console.error("Create vertical error:", err);
            setVerticalSubmitStatus("Failed to add vertical.");
        }
    };

    const handleDeleteVertical = async (id) => {
        if (!confirm("Are you sure you want to delete this business vertical?")) return;
        try {
            await axios.delete(`${VERTICALS_URL}${id}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete vertical error:", err);
            alert("Failed to delete vertical.");
        }
    };

    const handleStartEditVertical = (v) => {
        setEditingVerticalId(v.id);
        setEditingVerticalData({
            title: v.title,
            description: v.description,
            icon_class: v.icon_class,
            order: v.order
        });
    };

    const handleSaveEditVertical = async (id) => {
        try {
            await axios.put(`${VERTICALS_URL}${id}/`, editingVerticalData, getAuthHeaders());
            setEditingVerticalId(null);
            fetchData();
        } catch (err) {
            console.error("Edit vertical error:", err);
            alert("Failed to save vertical changes.");
        }
    };

    // --- STRENGTHS CRUD HANDLERS ---
    const handleStrengthChange = (e) => {
        const { name, value } = e.target;
        setNewStrength(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateStrength = async (e) => {
        e.preventDefault();
        setStrengthSubmitStatus("Adding strength...");
        try {
            await axios.post(STRENGTHS_URL, newStrength, getAuthHeaders());
            setStrengthSubmitStatus("Strength added successfully!");
            setNewStrength({ title: "", description: "", icon_class: "FaGlobe", bg_color: "bg-amber-500", order: 0 });
            fetchData();
            setTimeout(() => setStrengthSubmitStatus(""), 4000);
        } catch (err) {
            console.error("Create strength error:", err);
            setStrengthSubmitStatus("Failed to add strength.");
        }
    };

    const handleDeleteStrength = async (id) => {
        if (!confirm("Are you sure you want to delete this strength?")) return;
        try {
            await axios.delete(`${STRENGTHS_URL}${id}/`, getAuthHeaders());
            fetchData();
        } catch (err) {
            console.error("Delete strength error:", err);
            alert("Failed to delete strength.");
        }
    };

    const handleStartEditStrength = (s) => {
        setEditingStrengthId(s.id);
        setEditingStrengthData({
            title: s.title,
            description: s.description,
            icon_class: s.icon_class,
            bg_color: s.bg_color,
            order: s.order
        });
    };

    const handleSaveEditStrength = async (id) => {
        try {
            await axios.put(`${STRENGTHS_URL}${id}/`, editingStrengthData, getAuthHeaders());
            setEditingStrengthId(null);
            fetchData();
        } catch (err) {
            console.error("Edit strength error:", err);
            alert("Failed to save strength changes.");
        }
    };

    const isEventExpired = (expireDate) => {
        if (!expireDate) return false;
        return new Date(expireDate) < new Date();
    };

    const formatCategory = (cat) => {
        if (!cat) return "";
        return cat.replace(/_/g, " ").toUpperCase();
    };

    // --- TAB RENDERING METHODS ---

    const renderDashboardTab = () => {
        return (
            <div className="space-y-8 text-left">
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <motion.div 
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl shadow-lg shadow-blue-500/5">
                                <FaBriefcase />
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Careers Submissions</span>
                                <h3 className="text-2xl font-black text-white mt-1 text-gradient">{applications.length} Apps</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl shadow-lg shadow-amber-500/5">
                                <FaEnvelope />
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Inbox Inquiries</span>
                                <h3 className="text-2xl font-black text-white mt-1 text-gradient">{messages.length} Messages</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/5">
                                <FaCalendarAlt />
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Events</span>
                                <h3 className="text-2xl font-black text-white mt-1 text-gradient">
                                    {events.filter(o => !isEventExpired(o.expire_date)).length} Active
                                </h3>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recents Splits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent CVs */}
                    <div className="glass-panel rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-5">
                            <h4 className="font-extrabold text-white text-lg tracking-tight">Recent CV Submissions</h4>
                            <button onClick={() => setActiveTab("applications")} className="text-xs font-bold text-amber-500 hover:text-amber-400 transition">View All</button>
                        </div>
                        {applications.length > 0 ? (
                            <div className="space-y-4">
                                {applications.slice(0, 4).map((app) => (
                                    <div key={app.id} className="flex justify-between items-center p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl hover:border-slate-800 transition-all duration-300">
                                        <div>
                                            <h5 className="font-bold text-white text-sm">{app.name}</h5>
                                            <p className="text-slate-400 text-xs mt-0.5 font-semibold">{app.email} | {app.phone}</p>
                                        </div>
                                        {app.cv && (
                                            <a 
                                                href={getCvUrlWithToken(app.cv)} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="p-2 bg-slate-800 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300"
                                            >
                                                <FaRegFilePdf />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm py-10 text-center font-medium">No applications submitted yet.</p>
                        )}
                    </div>

                    {/* Recent Messages */}
                    <div className="glass-panel rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-5">
                            <h4 className="font-extrabold text-white text-lg tracking-tight">Recent Inbox Inquiries</h4>
                            <button onClick={() => setActiveTab("messages")} className="text-xs font-bold text-amber-500 hover:text-amber-400 transition">View All</button>
                        </div>
                        {messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.slice(0, 4).map((msg) => (
                                    <div key={msg.id} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl hover:border-slate-800 transition-all duration-300 text-left">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h5 className="font-bold text-white text-sm">{msg.name}</h5>
                                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">{new Date(msg.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-semibold text-amber-500 text-xs mb-1">Subject: {msg.subject || "No Subject"}</p>
                                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm py-10 text-center font-medium">No messages received yet.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderApplicationsTab = () => {
        return (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
                <h3 className="font-extrabold text-white text-xl mb-6 pb-4 border-b border-slate-800/85">
                    Manage Career Submissions
                </h3>

                {applications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                    <th className="py-4 px-4 text-left">Applicant</th>
                                    <th className="py-4 px-4 text-left">Contact Info</th>
                                    <th className="py-4 px-4 text-left">Cover Message</th>
                                    <th className="py-4 px-4 text-center">Resume CV</th>
                                    <th className="py-4 px-4 text-right">Submitted Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-900/25 transition">
                                        <td className="py-4 px-4 font-bold text-white">{app.name}</td>
                                        <td className="py-4 px-4 text-xs">
                                            <div className="flex flex-col gap-1 font-semibold text-slate-400">
                                                <span className="flex items-center gap-1.5"><FaEnvelope className="text-slate-500" />{app.email}</span>
                                                <span className="flex items-center gap-1.5"><FaPhone className="text-slate-500" />{app.phone}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-slate-400 max-w-xs truncate font-medium" title={app.message}>
                                            {app.message || "-"}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {app.cv ? (
                                                <a 
                                                    href={getCvUrlWithToken(app.cv)} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 text-blue-400 hover:text-white font-bold text-xs rounded-lg transition-all duration-300 shadow-sm"
                                                >
                                                    <FaRegFilePdf />
                                                    <span>PDF</span>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-600 font-bold">No CV Attached</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right text-xs text-slate-500 font-bold">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm py-12 text-center font-medium">No career applications found.</p>
                )}
            </div>
        );
    };

    const renderMessagesTab = () => {
        return (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
                <h3 className="font-extrabold text-white text-xl mb-6 pb-4 border-b border-slate-800/85">
                    Client & Partner Inbox
                </h3>

                {messages.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                    <th className="py-4 px-4 text-left">Sender Details</th>
                                    <th className="py-4 px-4 text-left">Subject</th>
                                    <th className="py-4 px-4 text-left">Message Content</th>
                                    <th className="py-4 px-4 text-right">Received Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {messages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-slate-900/25 transition">
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-white">{msg.name}</div>
                                            <div className="text-[10px] text-slate-500 font-bold tracking-wide">{msg.email}</div>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-amber-500 text-xs">{msg.subject || "No Subject"}</td>
                                        <td className="py-4 px-4 text-xs text-slate-300 max-w-md whitespace-pre-wrap leading-relaxed font-medium">
                                            {msg.message}
                                        </td>
                                        <td className="py-4 px-4 text-right text-xs text-slate-500 font-bold">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm py-12 text-center font-medium">No inbox messages received.</p>
                )}
            </div>
        );
    };

    const renderEventsTab = () => {
        return (
            <div className="space-y-8 text-left">
                {/* Status Message */}
                {eventSubmitStatus && (
                    <div className={`p-4 rounded-xl text-sm font-bold border transition-all duration-300 ${
                        eventSubmitStatusType === "success" 
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                            : eventSubmitStatusType === "error" 
                            ? "bg-rose-950/20 border-rose-500/30 text-rose-400" 
                            : "bg-blue-950/20 border-blue-500/30 text-blue-400"
                    }`}>
                        {eventSubmitStatus}
                    </div>
                )}

                {/* Form to Add New Offer */}
                <AnimatePresence>
                    {showAddEventForm && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
                                    <h4 className="font-extrabold text-white text-lg">Create & Activate New Event</h4>
                                    <button 
                                        onClick={() => setShowAddEventForm(false)} 
                                        className="text-slate-400 hover:text-white transition duration-200 text-xl"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateEvent} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Event Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                placeholder="e.g. Weekend Mega Sale"
                                                value={newEvent.title}
                                                onChange={handleNewEventChange}
                                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Branch Location</label>
                                            <select
                                                name="category"
                                                value={newEvent.category}
                                                onChange={handleNewEventChange}
                                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                                required
                                            >
                                                {branches.map(branch => (
                                                    <option key={branch.id} value={branch.key} className="bg-[#080b11] text-slate-350">
                                                        {branch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-1">
                                            <div>
                                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Expire Date</label>
                                                <input
                                                    type="date"
                                                    value={newEventDate}
                                                    onChange={(e) => setNewEventDate(e.target.value)}
                                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Hour</label>
                                                <select
                                                    value={newEventHour}
                                                    onChange={(e) => setNewEventHour(e.target.value)}
                                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                                    disabled={!newEventDate}
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                                                        <option key={h} value={h} className="bg-slate-950 text-white">
                                                            {h} ({parseInt(h) === 0 ? "12 AM" : parseInt(h) === 12 ? "12 PM" : parseInt(h) < 12 ? `${parseInt(h)} AM` : `${parseInt(h) - 12} PM`})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Minute</label>
                                                <select
                                                    value={newEventMinute}
                                                    onChange={(e) => setNewEventMinute(e.target.value)}
                                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                                    disabled={!newEventDate}
                                                >
                                                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                                                        <option key={m} value={m} className="bg-slate-950 text-white">{m}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Attach PDF or Image Event Details</label>
                                            <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-500/5 transition bg-slate-950/40 flex items-center justify-center cursor-pointer text-center group">
                                                <input
                                                    type="file"
                                                    name="pdfs"
                                                    accept=".pdf,image/*"
                                                    multiple
                                                    onChange={handleNewEventChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    ref={eventPdfInputRef}
                                                    required
                                                />
                                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold truncate max-w-full px-2 group-hover:text-white transition duration-200">
                                                    <FaUpload className="flex-shrink-0 text-blue-400" />
                                                    <span className="truncate">
                                                        {newEvent.pdfs.length > 0 
                                                            ? `${newEvent.pdfs.length} files selected` 
                                                            : "Upload PDF or Image files"
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Cover Preview Image (Optional)</label>
                                            <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-500/5 transition bg-slate-950/40 flex items-center justify-center cursor-pointer text-center group">
                                                <input
                                                    type="file"
                                                    name="thumbnail"
                                                    accept="image/*"
                                                    onChange={handleNewEventThumbnailChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    ref={eventThumbnailInputRef}
                                                />
                                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold truncate max-w-full px-2 group-hover:text-white transition duration-200">
                                                    <FaUpload className="flex-shrink-0 text-blue-400" />
                                                    <span className="truncate">
                                                        {newEvent.thumbnail ? newEvent.thumbnail.name : "Upload cover photo"}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-semibold mt-1.5 text-left">Recommended: Cover thumbnail image under 2MB.</p>
                                            {renderSelectedImageSpecs("event", 2048)}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddEventForm(false)}
                                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Activate Event
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Offers Table */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-6">
                        <h4 className="font-extrabold text-white text-lg">Active & Expired Events</h4>
                        {!showAddEventForm && (
                            <button 
                                onClick={() => setShowAddEventForm(true)} 
                                className="px-4 py-2 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-0.5"
                            >
                                <FaPlus />
                                <span>Create New Event</span>
                            </button>
                        )}
                    </div>

                    {events.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <th className="py-4 px-4">Preview</th>
                                        <th className="py-4 px-4">Event Title</th>
                                        <th className="py-4 px-4">Branch Location</th>
                                        <th className="py-4 px-4">Expiry Date</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {events.map((event) => {
                                        const expired = isEventExpired(event.expire_date);
                                        const isEditing = editingEventId === event.id;
                                        const firstPdfId = event.pdfs?.[0]?.id;
                                        const isFirstFileImage = event.pdfs?.[0]?.pdf_url ? isImageFile(event.pdfs[0].pdf_url) : false;
                                        const mainThumbnail = event.pdfs?.[0]?.thumbnail_url || (isFirstFileImage ? event.pdfs[0].pdf_url : "");
                                        const hasThumbnailError = firstPdfId ? eventThumbnailErrors[firstPdfId] : false;
                                        
                                        return (
                                            <tr key={event.id} className="hover:bg-slate-900/25 transition">
                                                <td className="py-4 px-4">
                                                    {mainThumbnail && !hasThumbnailError ? (
                                                        <img 
                                                            src={getCleanImageUrl(mainThumbnail)} 
                                                            alt="doc-thumb" 
                                                            onError={() => {
                                                                if (firstPdfId) {
                                                                    setEventThumbnailErrors(prev => ({ ...prev, [firstPdfId]: true }));
                                                                }
                                                            }}
                                                            className="w-12 h-16 object-cover rounded-lg border border-slate-800 shadow-sm" 
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-16 bg-slate-950/60 text-slate-650 rounded-lg flex items-center justify-center text-lg border border-slate-800">
                                                            <FaRegFilePdf className="text-slate-600" />
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 font-bold text-white">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingEventData.title}
                                                            onChange={(e) => setEditingEventData({ ...editingEventData, title: e.target.value })}
                                                            className="border border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full bg-slate-950 text-white font-semibold outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        event.title
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-xs font-bold text-slate-400">
                                                    {isEditing ? (
                                                        <select
                                                            value={editingEventData.category}
                                                            onChange={(e) => setEditingEventData({ ...editingEventData, category: e.target.value })}
                                                            className="border border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full bg-slate-950 text-white font-semibold outline-none focus:border-blue-500"
                                                        >
                                                            {branches.map(branch => (
                                                                <option key={branch.id} value={branch.key} className="bg-[#080b11] text-slate-350">
                                                                    {branch.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        formatCategory(event.category)
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-xs font-bold text-slate-400">
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                                            <input
                                                                type="date"
                                                                value={editingEventDate}
                                                                onChange={(e) => setEditingEventDate(e.target.value)}
                                                                className="border border-slate-800 rounded-lg px-2 py-1 text-xs bg-slate-950 text-white font-semibold outline-none focus:border-blue-500 w-full"
                                                            />
                                                            <div className="flex gap-1">
                                                                <select
                                                                    value={editingEventHour}
                                                                    onChange={(e) => setEditingEventHour(e.target.value)}
                                                                    className="border border-slate-800 rounded-lg px-2 py-1 text-xs bg-slate-950 text-white font-semibold outline-none focus:border-blue-500 w-1/2"
                                                                    disabled={!editingEventDate}
                                                                >
                                                                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                                                                        <option key={h} value={h} className="bg-slate-950 text-white">
                                                                            {h} ({parseInt(h) === 0 ? "12 AM" : parseInt(h) === 12 ? "12 PM" : parseInt(h) < 12 ? `${parseInt(h)} AM` : `${parseInt(h) - 12} PM`})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={editingEventMinute}
                                                                    onChange={(e) => setEditingEventMinute(e.target.value)}
                                                                    className="border border-slate-800 rounded-lg px-2 py-1 text-xs bg-slate-950 text-white font-semibold outline-none focus:border-blue-500 w-1/2"
                                                                    disabled={!editingEventDate}
                                                                >
                                                                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                                                                        <option key={m} value={m} className="bg-slate-950 text-white">{m}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        event.expire_date ? new Date(event.expire_date).toLocaleString() : "No Limit"
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    {expired ? (
                                                        <span className="px-2.5 py-1 text-[9px] bg-rose-950/20 border border-rose-900/40 text-rose-400 font-extrabold uppercase tracking-wider rounded-full">
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-[9px] bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 font-extrabold uppercase tracking-wider rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEditEvent(event.id)}
                                                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEditEvent}
                                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStartEditEvent(event)}
                                                                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg hover:text-white transition"
                                                                    title="Edit Details"
                                                                >
                                                                    <FaEdit className="text-xs" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                    className="p-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                                                                    title="Delete Event"
                                                                >
                                                                    <FaTrash className="text-xs" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No events created yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderBrandsTab = () => {
        return (
            <div className="space-y-8 text-left">
                {brandSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {brandSubmitStatus}
                    </div>
                )}

                {/* Add Brand Form */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Upload New Brand / Partner Logo
                    </h4>
                    <form onSubmit={handleCreateBrand} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Brand / Partner Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Abreco Freight"
                                    value={newBrand.name}
                                    onChange={handleBrandChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Select Logo Image</label>
                                <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-500/5 transition bg-slate-950/40 flex items-center justify-center cursor-pointer text-center group">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleBrandChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        ref={brandFileInputRef}
                                        required
                                    />
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold group-hover:text-white transition duration-200">
                                        <FaUpload className="text-blue-400" />
                                        <span>
                                            {newBrand.image ? newBrand.image.name : "Choose logo file"}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-semibold mt-1.5 text-left">Recommended: Transparent PNG logo, under 2MB.</p>
                                {renderSelectedImageSpecs("brand", 2048)}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-800/80">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Upload Logo
                            </button>
                        </div>
                    </form>
                </div>

                {/* Existing Logos Grid */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Active Scrolling Brand Logos
                    </h4>
                    {brandLogos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                            {brandLogos.map((brand) => (
                                <div key={brand.id} className="relative group border border-slate-800/80 p-4 bg-slate-950/40 rounded-2xl flex flex-col items-center justify-between shadow-lg transition duration-300 hover:border-slate-700">
                                    <img
                                        src={getCleanImageUrl(brand.image_url || brand.image)}
                                        alt={brand.name || "Brand"}
                                        className="h-12 w-auto object-contain mb-3 brightness-90 group-hover:brightness-100 transition duration-300"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-full">
                                        {brand.name || "Unnamed"}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteBrand(brand.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-950/50 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete Brand Logo"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No brand logos in database. Using default fallback logos on the site.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderProjectsTab = () => {
        return (
            <div className="space-y-8 text-left">
                {projectSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {projectSubmitStatus}
                    </div>
                )}

                {/* Add Project Form */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Create New Project Section
                    </h4>
                    <form onSubmit={handleCreateProject} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Project Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Spice Village Alain Restaurant"
                                    value={newProject.title}
                                    onChange={handleProjectChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Branch Location</label>
                                <select
                                    name="category"
                                    value={newProject.category}
                                    onChange={handleProjectChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                >
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.key} className="bg-[#080b11] text-slate-350">
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Select Main / Hero Image</label>
                                <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-500/5 transition bg-slate-950/40 flex items-center justify-center cursor-pointer text-center group">
                                    <input
                                        type="file"
                                        name="main_image"
                                        accept="image/*"
                                        onChange={handleProjectChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        ref={projectFileInputRef}
                                        required
                                    />
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold group-hover:text-white transition duration-200">
                                        <FaUpload className="text-blue-400" />
                                        <span>
                                            {newProject.main_image ? newProject.main_image.name : "Choose project main image"}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-semibold mt-1.5 text-left">Recommended: JPEG under 2MB.</p>
                                {renderSelectedImageSpecs("project", 2048)}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-800/80">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>

                {/* Existing Projects List */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Projects List & Sub-Gallery Manager
                    </h4>
                    {projects.length > 0 ? (
                        <div className="space-y-6">
                            {projects.map((project) => {
                                const isExpanded = expandedProjectId === project.id;
                                return (
                                    <div key={project.id} className="border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl bg-slate-950/20">
                                        <div className="flex flex-col sm:flex-row justify-between items-center p-5 bg-[#0e1422]/60 border-b border-slate-800/60 gap-4">
                                            <div className="flex items-center gap-4 w-full text-left">
                                                <img
                                                    src={getCleanImageUrl(project.main_image_url || project.main_image)}
                                                    alt={project.title}
                                                    className="w-16 h-12 object-cover rounded-lg border border-slate-800"
                                                />
                                                <div>
                                                    <h5 className="font-extrabold text-white text-base leading-snug">{project.title}</h5>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                            {formatCategory(project.category)}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                            {project.images ? project.images.length : 0} sub-gallery images
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                <button
                                                    onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                                                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-300 w-full sm:w-auto ${
                                                        isExpanded 
                                                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                                                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                                                    }`}
                                                >
                                                    {isExpanded ? "Close Gallery" : "Manage Gallery"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    className="p-2.5 bg-rose-950/30 hover:bg-rose-600 border border-rose-900/50 hover:border-rose-500 text-rose-400 hover:text-white rounded-xl transition duration-300"
                                                    title="Delete Project"
                                                >
                                                    <FaTrash className="text-xs" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded project sub-gallery panel */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 bg-[#0a0f1d]/40 border-t border-slate-850/80 space-y-6">
                                                        {gallerySubmitStatus && (
                                                            <div className="p-3 rounded-lg text-xs font-bold border bg-amber-950/20 border-amber-500/30 text-amber-400">
                                                                {gallerySubmitStatus}
                                                            </div>
                                                        )}
                                                        {/* Add Sub Gallery Image Form */}
                                                        <form onSubmit={handleAddGalleryImage} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-950/30 border border-slate-800/80 p-4 rounded-2xl shadow-inner">
                                                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1.5">Gallery Image Title (Optional)</label>
                                                                    <input
                                                                        type="text"
                                                                        name="title"
                                                                        placeholder="e.g. Interior Dining Area"
                                                                        value={newGalleryImage.title}
                                                                        onChange={handleGalleryImageChange}
                                                                        className="w-full border border-slate-800 rounded-lg p-2.5 bg-slate-900/40 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-slate-900 text-white transition duration-200"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1.5">Gallery Image File</label>
                                                                    <div className="relative border-2 border-dashed border-slate-800 rounded-lg p-2.5 bg-slate-900/40 hover:border-blue-500 hover:bg-blue-500/5 transition flex items-center justify-center cursor-pointer text-center group">
                                                                        <input
                                                                            type="file"
                                                                            name="image"
                                                                            accept="image/*"
                                                                            onChange={handleGalleryImageChange}
                                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                                            ref={galleryFileInputRef}
                                                                            required
                                                                        />
                                                                        <span className="text-[10px] text-slate-400 font-bold truncate px-2 group-hover:text-white transition duration-200">
                                                                            {newGalleryImage.image ? newGalleryImage.image.name : "Choose gallery file"}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-500 font-semibold mt-1 text-left">Recommended: Under 2MB.</p>
                                                                    {renderSelectedImageSpecs("gallery", 2048)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    type="submit"
                                                                    className="w-full py-2.5 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow transition duration-300"
                                                                >
                                                                    Add Gallery Image
                                                                </button>
                                                            </div>
                                                        </form>

                                                        {/* Sub-gallery list/thumbnails */}
                                                        <div>
                                                            <h6 className="font-extrabold text-slate-450 text-xs mb-4 uppercase tracking-wider text-left">Current Sub-Images</h6>
                                                            {project.images && project.images.length > 0 ? (
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                                                    {project.images.map((img) => {
                                                                        const isEditing = editingGalleryImageId === img.id;
                                                                        return (
                                                                            <div key={img.id} className="relative group border border-slate-800 bg-slate-900/20 p-2 rounded-xl flex flex-col items-center shadow-md hover:border-slate-700 transition duration-300">
                                                                                <img
                                                                                    src={getCleanImageUrl(img.image_url || img.image)}
                                                                                    alt={img.title || "Gallery"}
                                                                                    className="w-full h-24 object-cover rounded-lg border border-slate-800"
                                                                                />
                                                                                {isEditing ? (
                                                                                    <div className="mt-2 w-full flex items-center gap-1">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={editingGalleryImageTitle}
                                                                                            onChange={(e) => setEditingGalleryImageTitle(e.target.value)}
                                                                                            className="w-full border border-slate-700 rounded px-1.5 py-0.5 bg-slate-950 text-[10px] font-semibold text-white outline-none focus:border-blue-500"
                                                                                            placeholder="Location title"
                                                                                            autoFocus
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleSaveEditGalleryImage(img.id)}
                                                                                            className="p-1 bg-emerald-950/50 hover:bg-emerald-600 border border-emerald-900/30 text-emerald-400 hover:text-white rounded transition"
                                                                                            title="Save Title"
                                                                                        >
                                                                                            <FaCheck className="text-[9px]" />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={handleCancelEditGalleryImage}
                                                                                            className="p-1 bg-slate-850 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded transition"
                                                                                            title="Cancel"
                                                                                        >
                                                                                            <FaTimes className="text-[9px]" />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-[9px] font-bold text-slate-450 mt-2 truncate w-full text-center">
                                                                                        {img.title || <span className="italic text-slate-605">No title</span>}
                                                                                    </span>
                                                                                )}
                                                                                
                                                                                {!isEditing && (
                                                                                    <>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleStartEditGalleryImage(img)}
                                                                                            className="absolute top-2 left-2 p-1.5 bg-blue-950/50 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md"
                                                                                            title="Edit Image Title"
                                                                                        >
                                                                                            <FaEdit className="text-[10px]" />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleDeleteGalleryImage(img.id)}
                                                                                            className="absolute top-2 right-2 p-1.5 bg-rose-950/50 hover:bg-rose-600 text-rose-450 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md"
                                                                                            title="Delete Gallery Image"
                                                                                        >
                                                                                            <FaTrash className="text-[10px]" />
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-slate-500 text-xs py-4 text-center font-medium">No additional gallery images uploaded for this project.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No projects in database. Fallback content will be displayed on the portfolio.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderBranchesTab = () => {
        return (
            <div className="space-y-8 text-left">
                {branchSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {branchSubmitStatus}
                    </div>
                )}

                {/* Create New Branch Form */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Add New Branch Location
                    </h4>
                    <form onSubmit={handleCreateBranch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Branch Display Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ABU DHABI - LEPTIS OUTLET"
                                    value={newBranchName}
                                    onChange={(e) => setNewBranchName(e.target.value)}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                                >
                                    Add Branch
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Existing Branches List */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Active Branch Locations
                    </h4>
                    {branches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <th className="py-4 px-4">Branch Name (Label)</th>
                                        <th className="py-4 px-4">Branch Key (System ID)</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {branches.map((branch) => {
                                        const isEditing = editingBranchId === branch.id;
                                        return (
                                            <tr key={branch.id} className="hover:bg-slate-900/25 transition">
                                                <td className="py-4 px-4 font-bold text-white">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingBranchName}
                                                            onChange={(e) => setEditingBranchName(e.target.value)}
                                                            className="border border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full bg-slate-950 text-white font-semibold outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        branch.name
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-xs font-semibold text-slate-400 font-mono">
                                                    {branch.key}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEditBranch(branch.id)}
                                                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer"
                                                                    title="Save Name"
                                                                >
                                                                    <FaCheck className="text-xs" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEditBranch}
                                                                    className="p-2 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes className="text-xs" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStartEditBranch(branch)}
                                                                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg hover:text-white transition cursor-pointer"
                                                                    title="Edit Name"
                                                                >
                                                                    <FaEdit className="text-xs" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBranch(branch.id)}
                                                                    className="p-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 text-rose-455 hover:text-white rounded-lg transition cursor-pointer"
                                                                    title="Delete Branch"
                                                                >
                                                                    <FaTrash className="text-xs" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No branch locations registered. Populate branches first to use selectors.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderMilestonesTab = () => {
        return (
            <div className="space-y-8 text-left">
                {milestoneSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {milestoneSubmitStatus}
                    </div>
                )}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">Add Corporate Milestone</h4>
                    <form onSubmit={handleCreateMilestone} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Year / Era</label>
                                <input
                                    type="text"
                                    name="year"
                                    placeholder="e.g. 2016 or Present"
                                    value={newMilestone.year}
                                    onChange={handleMilestoneChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Milestone Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Foundation in UAE"
                                    value={newMilestone.title}
                                    onChange={handleMilestoneChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Display Order (Sorting)</label>
                                <input
                                    type="number"
                                    name="order"
                                    placeholder="0"
                                    value={newMilestone.order}
                                    onChange={handleMilestoneChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Description Detail</label>
                            <textarea
                                name="description"
                                rows="3"
                                placeholder="Describe what was accomplished during this milestone..."
                                value={newMilestone.description}
                                onChange={handleMilestoneChange}
                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition duration-200">
                                Add Milestone
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">Timeline Milestones List</h4>
                    {milestones.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <th className="py-4 px-4 w-24">Year</th>
                                        <th className="py-4 px-4 w-48">Title</th>
                                        <th className="py-4 px-4">Description</th>
                                        <th className="py-4 px-4 w-20">Order</th>
                                        <th className="py-4 px-4 text-right w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {milestones.map((m) => {
                                        const isEditing = editingMilestoneId === m.id;
                                        return (
                                            <tr key={m.id} className="hover:bg-slate-900/25 transition">
                                                <td className="py-4 px-4 font-black text-amber-500">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingMilestoneData.year}
                                                            onChange={(e) => setEditingMilestoneData({ ...editingMilestoneData, year: e.target.value })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        m.year
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-white">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingMilestoneData.title}
                                                            onChange={(e) => setEditingMilestoneData({ ...editingMilestoneData, title: e.target.value })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        m.title
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-slate-400 text-xs leading-normal">
                                                    {isEditing ? (
                                                        <textarea
                                                            value={editingMilestoneData.description}
                                                            onChange={(e) => setEditingMilestoneData({ ...editingMilestoneData, description: e.target.value })}
                                                            rows="2"
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500 resize-none"
                                                        />
                                                    ) : (
                                                        m.description
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editingMilestoneData.order}
                                                            onChange={(e) => setEditingMilestoneData({ ...editingMilestoneData, order: parseInt(e.target.value) || 0 })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-16 bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        m.order
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSaveEditMilestone(m.id)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"><FaCheck className="text-xs" /></button>
                                                                <button onClick={() => setEditingMilestoneId(null)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"><FaTimes className="text-xs" /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleStartEditMilestone(m)} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg hover:text-white transition"><FaEdit className="text-xs" /></button>
                                                                <button onClick={() => handleDeleteMilestone(m.id)} className="p-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 text-rose-455 hover:text-white rounded-lg transition"><FaTrash className="text-xs" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No timeline milestones added yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderVerticalsTab = () => {
        return (
            <div className="space-y-8 text-left">
                {verticalSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {verticalSubmitStatus}
                    </div>
                )}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">Add Business Vertical</h4>
                    <form onSubmit={handleCreateVertical} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Vertical Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Logistics & Supply Chain"
                                    value={newVertical.title}
                                    onChange={handleVerticalChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Icon Class Name (react-icons/fa)</label>
                                <select
                                    name="icon_class"
                                    value={newVertical.icon_class}
                                    onChange={handleVerticalChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                >
                                    <option value="FaTruck">FaTruck (Truck / Cargo)</option>
                                    <option value="FaShip">FaShip (Ship / Ocean)</option>
                                    <option value="FaStore">FaStore (Store / Retail)</option>
                                    <option value="FaHandshake">FaHandshake (Handshake / Produce)</option>
                                    <option value="FaBuilding">FaBuilding (Building / Corporate)</option>
                                    <option value="FaGlobe">FaGlobe (Globe / World)</option>
                                    <option value="FaBox">FaBox (Box / Parcel)</option>
                                    <option value="FaWarehouse">FaWarehouse (Warehouse)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    placeholder="0"
                                    value={newVertical.order}
                                    onChange={handleVerticalChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Short Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                placeholder="Describe this business vertical's services..."
                                value={newVertical.description}
                                onChange={handleVerticalChange}
                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition duration-200">
                                Add Business Vertical
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">Business Verticals List</h4>
                    {verticals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <th className="py-4 px-4 w-28">Icon</th>
                                        <th className="py-4 px-4 w-60">Title</th>
                                        <th className="py-4 px-4">Description</th>
                                        <th className="py-4 px-4 w-20">Order</th>
                                        <th className="py-4 px-4 text-right w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {verticals.map((v) => {
                                        const isEditing = editingVerticalId === v.id;
                                        return (
                                            <tr key={v.id} className="hover:bg-slate-900/25 transition">
                                                <td className="py-4 px-4 text-amber-500 font-bold">
                                                    {isEditing ? (
                                                        <select
                                                            value={editingVerticalData.icon_class}
                                                            onChange={(e) => setEditingVerticalData({ ...editingVerticalData, icon_class: e.target.value })}
                                                            className="border border-slate-800 rounded px-1.5 py-1 text-xs bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        >
                                                            <option value="FaTruck">FaTruck</option>
                                                            <option value="FaShip">FaShip</option>
                                                            <option value="FaStore">FaStore</option>
                                                            <option value="FaHandshake">FaHandshake</option>
                                                            <option value="FaBuilding">FaBuilding</option>
                                                            <option value="FaGlobe">FaGlobe</option>
                                                            <option value="FaBox">FaBox</option>
                                                            <option value="FaWarehouse">FaWarehouse</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-slate-400 font-semibold">{v.icon_class}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-white">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingVerticalData.title}
                                                            onChange={(e) => setEditingVerticalData({ ...editingVerticalData, title: e.target.value })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        v.title
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-slate-400 text-xs leading-normal">
                                                    {isEditing ? (
                                                        <textarea
                                                            value={editingVerticalData.description}
                                                            onChange={(e) => setEditingVerticalData({ ...editingVerticalData, description: e.target.value })}
                                                            rows="2"
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500 resize-none"
                                                        />
                                                    ) : (
                                                        v.description
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editingVerticalData.order}
                                                            onChange={(e) => setEditingVerticalData({ ...editingVerticalData, order: parseInt(e.target.value) || 0 })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-16 bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        v.order
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSaveEditVertical(v.id)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"><FaCheck className="text-xs" /></button>
                                                                <button onClick={() => setEditingVerticalId(null)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"><FaTimes className="text-xs" /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleStartEditVertical(v)} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg hover:text-white transition"><FaEdit className="text-xs" /></button>
                                                                <button onClick={() => handleDeleteVertical(v.id)} className="p-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 text-rose-455 hover:text-white rounded-lg transition"><FaTrash className="text-xs" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No business verticals added yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderStrengthsTab = () => {
        return (
            <div className="space-y-8 text-left">
                {strengthSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {strengthSubmitStatus}
                    </div>
                )}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">Add Corporate Strength</h4>
                    <form onSubmit={handleCreateStrength} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Strength Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Quality Assurance"
                                    value={newStrength.title}
                                    onChange={handleStrengthChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Icon Class (react-icons/fa)</label>
                                <select
                                    name="icon_class"
                                    value={newStrength.icon_class}
                                    onChange={handleStrengthChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                >
                                    <option value="FaGlobe">FaGlobe (Globe)</option>
                                    <option value="FaCheckCircle">FaCheckCircle (Checkmark)</option>
                                    <option value="FaUserCheck">FaUserCheck (Customer Check)</option>
                                    <option value="FaChartLine">FaChartLine (Chart / Growth)</option>
                                    <option value="FaAward">FaAward (Award / Medal)</option>
                                    <option value="FaBuilding">FaBuilding (Building)</option>
                                    <option value="FaShieldAlt">FaShieldAlt (Shield / Security)</option>
                                    <option value="FaThumbsUp">FaThumbsUp (Thumbs Up)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Color Theme</label>
                                <select
                                    name="bg_color"
                                    value={newStrength.bg_color}
                                    onChange={handleStrengthChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                >
                                    <option value="bg-[#194a9a]">Blue theme (bg-[#194a9a])</option>
                                    <option value="bg-amber-500">Amber theme (bg-amber-500)</option>
                                    <option value="bg-emerald-500">Green theme (bg-emerald-500)</option>
                                    <option value="bg-orange-500">Orange theme (bg-orange-500)</option>
                                    <option value="bg-red-500">Red theme (bg-red-500)</option>
                                    <option value="bg-purple-500">Purple theme (bg-purple-500)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    placeholder="0"
                                    value={newStrength.order}
                                    onChange={handleStrengthChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Strength Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                placeholder="Describe why this strength sets the company apart..."
                                value={newStrength.description}
                                onChange={handleStrengthChange}
                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition duration-200">
                                Add Strength
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">Corporate Strengths List</h4>
                    {strengths.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <th className="py-4 px-4 w-28">Icon</th>
                                        <th className="py-4 px-4 w-28">Color Theme</th>
                                        <th className="py-4 px-4 w-48">Title</th>
                                        <th className="py-4 px-4">Description</th>
                                        <th className="py-4 px-4 w-20">Order</th>
                                        <th className="py-4 px-4 text-right w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {strengths.map((s) => {
                                        const isEditing = editingStrengthId === s.id;
                                        return (
                                            <tr key={s.id} className="hover:bg-slate-900/25 transition">
                                                <td className="py-4 px-4 text-amber-500 font-bold">
                                                    {isEditing ? (
                                                        <select
                                                            value={editingStrengthData.icon_class}
                                                            onChange={(e) => setEditingStrengthData({ ...editingStrengthData, icon_class: e.target.value })}
                                                            className="border border-slate-800 rounded px-1.5 py-1 text-xs bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        >
                                                            <option value="FaGlobe">FaGlobe</option>
                                                            <option value="FaCheckCircle">FaCheckCircle</option>
                                                            <option value="FaUserCheck">FaUserCheck</option>
                                                            <option value="FaChartLine">FaChartLine</option>
                                                            <option value="FaAward">FaAward</option>
                                                            <option value="FaBuilding">FaBuilding</option>
                                                            <option value="FaShieldAlt">FaShieldAlt</option>
                                                            <option value="FaThumbsUp">FaThumbsUp</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-slate-400 font-semibold">{s.icon_class}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-slate-400 text-xs">
                                                    {isEditing ? (
                                                        <select
                                                            value={editingStrengthData.bg_color}
                                                            onChange={(e) => setEditingStrengthData({ ...editingStrengthData, bg_color: e.target.value })}
                                                            className="border border-slate-800 rounded px-1.5 py-1 text-xs bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        >
                                                            <option value="bg-[#194a9a]">Blue</option>
                                                            <option value="bg-amber-500">Amber</option>
                                                            <option value="bg-emerald-500">Green</option>
                                                            <option value="bg-orange-500">Orange</option>
                                                            <option value="bg-red-500">Red</option>
                                                            <option value="bg-purple-500">Purple</option>
                                                        </select>
                                                    ) : (
                                                        <span className="inline-block w-4 h-4 rounded-full border border-slate-850" style={{ backgroundColor: s.bg_color === 'bg-[#194a9a]' ? '#194a9a' : s.bg_color === 'bg-amber-500' ? '#f59e0b' : s.bg_color === 'bg-emerald-500' ? '#10b981' : s.bg_color === 'bg-orange-500' ? '#f97316' : s.bg_color === 'bg-red-500' ? '#ef4444' : '#8b5cf6' }}></span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-white">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingStrengthData.title}
                                                            onChange={(e) => setEditingStrengthData({ ...editingStrengthData, title: e.target.value })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        s.title
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-slate-400 text-xs leading-normal">
                                                    {isEditing ? (
                                                        <textarea
                                                            value={editingStrengthData.description}
                                                            onChange={(e) => setEditingStrengthData({ ...editingStrengthData, description: e.target.value })}
                                                            rows="2"
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-full bg-slate-950 text-white outline-none focus:border-blue-500 resize-none"
                                                        />
                                                    ) : (
                                                        s.description
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editingStrengthData.order}
                                                            onChange={(e) => setEditingStrengthData({ ...editingStrengthData, order: parseInt(e.target.value) || 0 })}
                                                            className="border border-slate-800 rounded px-2 py-1 text-xs w-16 bg-slate-950 text-white outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        s.order
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSaveEditStrength(s.id)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"><FaCheck className="text-xs" /></button>
                                                                <button onClick={() => setEditingStrengthId(null)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"><FaTimes className="text-xs" /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleStartEditStrength(s)} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg hover:text-white transition"><FaEdit className="text-xs" /></button>
                                                                <button onClick={() => handleDeleteStrength(s.id)} className="p-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 text-rose-455 hover:text-white rounded-lg transition"><FaTrash className="text-xs" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No strengths added yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderTeamTab = () => {
        return (
            <div className="space-y-8 text-left">
                {teamMemberSubmitStatus && (
                    <div className="p-4 rounded-xl text-sm font-bold border bg-blue-950/20 border-blue-500/30 text-blue-400 transition-all duration-300">
                        {teamMemberSubmitStatus}
                    </div>
                )}

                {/* Add Team Member Form */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Add New Team Member
                    </h4>
                    <form onSubmit={handleCreateTeamMember} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. John Doe"
                                        value={newTeamMember.name}
                                        onChange={handleTeamMemberChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Role / Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        placeholder="e.g. Director"
                                        value={newTeamMember.position}
                                        onChange={handleTeamMemberChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Team Member Photo</label>
                                <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-500/5 transition bg-slate-950/40 flex items-center justify-center cursor-pointer text-center group">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleTeamMemberChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        ref={teamMemberFileInputRef}
                                        required
                                    />
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold group-hover:text-white transition duration-200">
                                        <FaUpload className="text-blue-400" />
                                        <span>
                                            {newTeamMember.image ? newTeamMember.image.name : "Choose member photo"}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-semibold mt-1.5 text-left">Recommended: JPEG/PNG under 2MB.</p>
                                {renderSelectedImageSpecs("team_member", 2048)}
                            </div>
                        </div>

                        <div className="border-t border-slate-800/80 pt-6">
                            <h5 className="font-extrabold text-white text-sm mb-4">Social Media Profile Links (Optional)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-slate-450 font-bold text-[10px] uppercase tracking-wider mb-2">Facebook URL</label>
                                    <input
                                        type="text"
                                        name="facebook_url"
                                        placeholder="#"
                                        value={newTeamMember.facebook_url}
                                        onChange={handleTeamMemberChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-450 font-bold text-[10px] uppercase tracking-wider mb-2">Twitter URL</label>
                                    <input
                                        type="text"
                                        name="twitter_url"
                                        placeholder="#"
                                        value={newTeamMember.twitter_url}
                                        onChange={handleTeamMemberChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-450 font-bold text-[10px] uppercase tracking-wider mb-2">YouTube URL</label>
                                    <input
                                        type="text"
                                        name="youtube_url"
                                        placeholder="#"
                                        value={newTeamMember.youtube_url}
                                        onChange={handleTeamMemberChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-800/80">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Add Team Member
                            </button>
                        </div>
                    </form>
                </div>

                {/* Existing Team Members List */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h4 className="font-extrabold text-white text-lg mb-6 pb-4 border-b border-slate-800/80">
                        Active Team Members List
                    </h4>
                    {teamMembers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <th className="py-4 px-4">Photo</th>
                                        <th className="py-4 px-4">Full Name</th>
                                        <th className="py-4 px-4">Role / Position</th>
                                        <th className="py-4 px-4">Social Accounts</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {teamMembers.map((member) => {
                                        const isEditing = editingTeamId === member.id;
                                        return (
                                            <tr key={member.id} className="hover:bg-slate-900/25 transition">
                                                <td className="py-4 px-4">
                                                    <img
                                                        src={getCleanImageUrl(member.image_url || member.image)}
                                                        alt={member.name}
                                                        className="w-12 h-12 object-cover rounded-full border border-slate-800 shadow-sm"
                                                    />
                                                </td>
                                                <td className="py-4 px-4 font-bold text-white">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingTeamData.name}
                                                            onChange={(e) => setEditingTeamData({ ...editingTeamData, name: e.target.value })}
                                                            className="border border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full bg-slate-950 text-white font-semibold outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        member.name
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-slate-400 text-xs">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingTeamData.position}
                                                            onChange={(e) => setEditingTeamData({ ...editingTeamData, position: e.target.value })}
                                                            className="border border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full bg-slate-950 text-white font-semibold outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        member.position
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-xs font-bold text-slate-400">
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                placeholder="FB URL"
                                                                value={editingTeamData.facebook_url}
                                                                onChange={(e) => setEditingTeamData({ ...editingTeamData, facebook_url: e.target.value })}
                                                                className="border border-slate-800 rounded px-2 py-0.5 text-[10px] w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Twitter URL"
                                                                value={editingTeamData.twitter_url}
                                                                onChange={(e) => setEditingTeamData({ ...editingTeamData, twitter_url: e.target.value })}
                                                                className="border border-slate-800 rounded px-2 py-0.5 text-[10px] w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="YT URL"
                                                                value={editingTeamData.youtube_url}
                                                                onChange={(e) => setEditingTeamData({ ...editingTeamData, youtube_url: e.target.value })}
                                                                className="border border-slate-800 rounded px-2 py-0.5 text-[10px] w-full bg-slate-950 text-white outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-semibold">
                                                            <span className="truncate">FB: <span className="text-amber-500">{member.facebook_url || "#"}</span></span>
                                                            <span className="truncate">TW: <span className="text-amber-500">{member.twitter_url || "#"}</span></span>
                                                            <span className="truncate">YT: <span className="text-amber-500">{member.youtube_url || "#"}</span></span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEditTeam(member.id)}
                                                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEditTeam}
                                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStartEditTeam(member)}
                                                                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg hover:text-white transition"
                                                                    title="Edit Member"
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTeamMember(member.id)}
                                                                    className="p-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 text-rose-450 hover:text-white rounded-lg transition"
                                                                    title="Delete Member"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm py-12 text-center font-medium">No team members uploaded yet. Static default team members are showing on homepage.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderSettingsTab = () => {
        return (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
                <h3 className="font-extrabold text-white text-xl mb-6 pb-4 border-b border-slate-800/80">
                    System Site Settings Configuration
                </h3>

                <form onSubmit={handleSettingsSubmit} className="space-y-8">
                    {/* Brand Meta */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            Company & Brand Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Company Display Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={settingsForm.company_name || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Announcement Header Alert Bar</label>
                                <input
                                    type="text"
                                    name="announcement_text"
                                    value={settingsForm.announcement_text || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Page Narratives */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            About Page Content Settings
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">About Page Title</label>
                                <input
                                    type="text"
                                    name="about_title"
                                    value={settingsForm.about_title || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Narrative Paragraph 1</label>
                                    <textarea
                                        name="about_narrative_1"
                                        rows="5"
                                        value={settingsForm.about_narrative_1 || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Narrative Paragraph 2</label>
                                    <textarea
                                        name="about_narrative_2"
                                        rows="5"
                                        value={settingsForm.about_narrative_2 || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Founder & Chairman Details */}
                            <div className="border-t border-slate-800/80 pt-4 space-y-4">
                                <h5 className="font-extrabold text-white text-sm">Founder & Chairman Leadership Quote</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Founder Name</label>
                                        <input
                                            type="text"
                                            name="founder_name"
                                            value={settingsForm.founder_name || ""}
                                            onChange={handleSettingsChange}
                                            className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Founder Title / Designation</label>
                                        <input
                                            type="text"
                                            name="founder_title"
                                            value={settingsForm.founder_title || ""}
                                            onChange={handleSettingsChange}
                                            className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Leadership Quote</label>
                                    <textarea
                                        name="founder_quote"
                                        rows="3"
                                        value={settingsForm.founder_quote || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Careers Pitch & Email Routing */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            Careers Page & Notification Routing
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Careers Header Title</label>
                                    <input
                                        type="text"
                                        name="careers_title"
                                        value={settingsForm.careers_title || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Recipient Email for CV Notifications</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="careers_email_recipient"
                                            value={settingsForm.careers_email_recipient || ""}
                                            onChange={handleSettingsChange}
                                            className="w-full border border-slate-800 rounded-xl p-3 pl-10 bg-slate-950/40 text-sm font-bold text-amber-500 outline-none focus:border-blue-500 focus:bg-slate-950 transition-all duration-300"
                                            required
                                        />
                                        <FaEnvelope className="absolute left-3.5 top-4 text-slate-550" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Careers Culture Pitch / Description</label>
                                <textarea
                                    name="careers_description"
                                    rows="5"
                                    value={settingsForm.careers_description || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            Contact & Office Locations
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Office Contact Email</label>
                                <input
                                    type="email"
                                    name="contact_email"
                                    value={settingsForm.contact_email || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Office Phone Number</label>
                                <input
                                    type="text"
                                    name="contact_phone"
                                    value={settingsForm.contact_phone || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Office Physical Address</label>
                                <input
                                    type="text"
                                    name="contact_address"
                                    value={settingsForm.contact_address || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Homepage Hero Configurations */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            Homepage Hero Layout Config
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Hero Header Title</label>
                                <input
                                    type="text"
                                    name="hero_title"
                                    value={settingsForm.hero_title || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Hero Description text</label>
                                <textarea
                                    name="hero_description"
                                    rows="3"
                                    value={settingsForm.hero_description || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Primary Button Text (Cta 1)</label>
                                    <input
                                        type="text"
                                        name="hero_btn1_text"
                                        value={settingsForm.hero_btn1_text || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Secondary Button Text (Cta 2)</label>
                                    <input
                                        type="text"
                                        name="hero_btn2_text"
                                        value={settingsForm.hero_btn2_text || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Configurations */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            Footer Links, Social Links & Copy
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Footer Slogan / About Summary</label>
                                <textarea
                                    name="footer_about_text"
                                    rows="3"
                                    value={settingsForm.footer_about_text || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300 resize-none font-medium"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Facebook Profile Page URL</label>
                                    <input
                                        type="text"
                                        name="facebook_url"
                                        value={settingsForm.facebook_url || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Instagram Profile URL</label>
                                    <input
                                        type="text"
                                        name="instagram_url"
                                        value={settingsForm.instagram_url || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">LinkedIn Corporate Page URL</label>
                                    <input
                                        type="text"
                                        name="linkedin_url"
                                        value={settingsForm.linkedin_url || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Twitter Profile URL</label>
                                    <input
                                        type="text"
                                        name="twitter_url"
                                        value={settingsForm.twitter_url || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Footer Copyright Notice</label>
                                <input
                                    type="text"
                                    name="copyright_text"
                                    value={settingsForm.copyright_text || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Website Signature</label>
                                <input
                                    type="text"
                                    name="site_signature"
                                    value={settingsForm.site_signature || ""}
                                    onChange={handleSettingsChange}
                                    className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* SEO Metadata Config */}
                        <div className="space-y-4 pt-4 border-t border-slate-800/40">
                            <h5 className="font-extrabold text-white text-sm flex items-center gap-2 border-l-4 border-amber-500 pl-2.5">
                                Search Engine (SEO) & WhatsApp Link Preview
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">SEO Meta Title</label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        value={settingsForm.meta_title || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        placeholder="Leptis Group"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">SEO Meta Keywords</label>
                                    <input
                                        type="text"
                                        name="meta_keywords"
                                        value={settingsForm.meta_keywords || ""}
                                        onChange={handleSettingsChange}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        placeholder="leptis, logistics, trading"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">SEO Meta Description</label>
                                    <textarea
                                        name="meta_description"
                                        value={settingsForm.meta_description || ""}
                                        onChange={handleSettingsChange}
                                        rows={2}
                                        className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all duration-300"
                                        placeholder="Provide website description context..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Configuration & Dynamic Uploads */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-white text-base flex items-center gap-2 border-l-4 border-[#194a9a] pl-2.5">
                            Dynamic Site Asset Image Uploader
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item 1: Hero BG */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.hero_bg_url) || "/ship-bg.jpg"} alt="hero" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.hero_bg && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.hero_bg.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.hero_bg.width}x{currentImageSpecs.hero_bg.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Hero Section Background</h5>
                                    <input 
                                        type="file" 
                                        name="hero_bg" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.hero_bg}
                                        className="text-xs w-full text-slate-450 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Under 2MB.</p>
                                    {renderSelectedImageSpecs("hero_bg", 2048)}
                                </div>
                            </div>

                            {/* Item 2: About Team */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.about_team_img_url) || "/team.jpg"} alt="team" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.about_team_img && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.about_team_img.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.about_team_img.width}x{currentImageSpecs.about_team_img.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">About Us page banner</h5>
                                    <input 
                                        type="file" 
                                        name="about_team_img" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.about_team_img}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Under 2MB.</p>
                                    {renderSelectedImageSpecs("about_team_img", 2048)}
                                </div>
                            </div>

                            {/* Item 3: Home About */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.home_about_img_url) || "/homeabout.jpg"} alt="homeabout" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.home_about_img && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.home_about_img.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.home_about_img.width}x{currentImageSpecs.home_about_img.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Homepage "Who We Are" Photo</h5>
                                    <input 
                                        type="file" 
                                        name="home_about_img" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.home_about_img}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Under 2MB.</p>
                                    {renderSelectedImageSpecs("home_about_img", 2048)}
                                </div>
                            </div>

                            {/* Item 4: Consult image */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.consult_img_url) || "/consultbg.png"} alt="consult" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.consult_img && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.consult_img.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.consult_img.width}x{currentImageSpecs.consult_img.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Consultation Side Banner</h5>
                                    <input 
                                        type="file" 
                                        name="consult_img" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.consult_img}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Under 2MB.</p>
                                    {renderSelectedImageSpecs("consult_img", 2048)}
                                </div>
                            </div>

                            {/* Item 5: Careers banner background */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.careers_bg_url) || "/ship-bg.jpg"} alt="careers bg" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.careers_bg && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.careers_bg.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.careers_bg.width}x{currentImageSpecs.careers_bg.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Careers Page Banner Background</h5>
                                    <input 
                                        type="file" 
                                        name="careers_bg" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.careers_bg}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Under 2MB.</p>
                                    {renderSelectedImageSpecs("careers_bg", 2048)}
                                </div>
                            </div>

                            {/* Item 6: Brands page background */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.brands_bg_url) || "/ship-bg.jpg"} alt="brands bg" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.brands_bg && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.brands_bg.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.brands_bg.width}x{currentImageSpecs.brands_bg.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Brands & Outlets Page Banner Background</h5>
                                    <input 
                                        type="file" 
                                        name="brands_bg" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.brands_bg}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Under 2MB.</p>
                                    {renderSelectedImageSpecs("brands_bg", 2048)}
                                </div>
                            </div>

                            {/* Item 7: Founder Image */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.founder_image_url) || "/team.jpg"} alt="founder" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.founder_image && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.founder_image.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.founder_image.width}x{currentImageSpecs.founder_image.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Founder & Chairman Photo</h5>
                                    <input 
                                        type="file" 
                                        name="founder_image" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.founder_image}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: Square crop, under 2MB.</p>
                                    {renderSelectedImageSpecs("founder_image", 2048)}
                                </div>
                            </div>

                            {/* Item 8: Website Logo */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.site_logo_url) || "/logo.png"} alt="site logo" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.site_logo && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.site_logo.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.site_logo.width}x{currentImageSpecs.site_logo.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Website Logo (Header & Footer)</h5>
                                    <input 
                                        type="file" 
                                        name="site_logo" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.site_logo}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: PNG format with transparency.</p>
                                    {renderSelectedImageSpecs("site_logo", 1024)}
                                </div>
                            </div>

                            {/* Item 9: WhatsApp & og:image preview */}
                            <div className="border border-slate-800/80 p-5 rounded-2xl bg-slate-950/30 flex flex-col sm:flex-row gap-5 items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                                        <img src={getCleanImageUrl(settingsForm.share_image_url) || "/logo.png"} alt="share image" className="w-full h-full object-cover" />
                                    </div>
                                    {currentImageSpecs.share_image && (
                                        <div className="flex flex-col items-center text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded gap-0.5 mt-2 w-24 text-center">
                                            <span>{currentImageSpecs.share_image.size}</span>
                                            <span className="text-blue-400 font-extrabold">{currentImageSpecs.share_image.width}x{currentImageSpecs.share_image.height}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left w-full">
                                    <h5 className="font-bold text-white text-sm mb-1.5">Social Share Link Preview Image</h5>
                                    <input 
                                        type="file" 
                                        name="share_image" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileRefs.share_image}
                                        className="text-xs w-full text-slate-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Recommended: 800x600 px or larger.</p>
                                    {renderSelectedImageSpecs("share_image", 2048)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status message */}
                    {updateStatus && (
                        <div className={`p-4 rounded-xl text-sm font-bold border transition-all duration-300 ${
                            updateStatusType === "success" 
                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                                : "bg-rose-950/20 border-rose-500/30 text-rose-400"
                        }`}>
                            {updateStatus}
                        </div>
                    )}

                    {/* Action Row */}
                    <div className="pt-6 border-t border-slate-800/80 flex justify-end">
                        <button
                            type="submit"
                            className="px-8 py-3.5 bg-[#194a9a] hover:bg-blue-600 text-white font-extrabold rounded-xl transition shadow-lg shadow-blue-900/20 text-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-300"
                        >
                            Save Site Configuration
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderSecurityTab = () => {
        return (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
                <h3 className="font-extrabold text-white text-xl mb-2 pb-4 border-b border-slate-800/80">
                    Firewall Security & Brute-Force Defense
                </h3>
                <p className="text-slate-400 text-xs mb-6 font-semibold">
                    Manage IP blacklists and monitor security firewall protections. Brute-force attacks are automatically blocked.
                </p>

                {/* Own IP Info */}
                {clientIp && (
                    <div className="mb-6 p-4 bg-blue-950/20 border border-blue-500/20 text-blue-300 rounded-2xl text-xs font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaBuilding className="text-blue-400" />
                            <span>Your current public IP address is: <span className="text-white font-extrabold">{clientIp}</span></span>
                        </div>
                        <span className="text-[10px] text-amber-500 uppercase tracking-widest font-black">Warning: Do not block yourself!</span>
                    </div>
                )}

                {/* Block IP Form */}
                <form onSubmit={handleBlockIp} className="space-y-4 mb-8 p-6 border border-slate-800 rounded-2xl bg-slate-950/20">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">Block New IP Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">IP Address</label>
                            <input
                                type="text"
                                placeholder="e.g. 192.168.1.100"
                                value={newIp}
                                onChange={(e) => setNewIp(e.target.value)}
                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">Reason for Block</label>
                            <input
                                type="text"
                                placeholder="e.g. Suspicious automated scanning"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-slate-950 text-white transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-500 text-xs font-semibold">{securityStatus}</span>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition text-xs shadow-lg shadow-rose-900/20"
                        >
                            Block IP Address
                        </button>
                    </div>
                </form>

                {/* Blocklist Table */}
                <div className="space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Firewall Blocklist ({blockedIps.length})</h4>
                    {blockedIps.length > 0 ? (
                        <div className="overflow-x-auto border border-slate-850 rounded-2xl">
                            <table className="min-w-full divide-y divide-slate-850 text-left">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="py-3.5 px-4 text-xs font-black uppercase text-slate-350 tracking-wider">Blocked IP</th>
                                        <th className="py-3.5 px-4 text-xs font-black uppercase text-slate-350 tracking-wider">Reason</th>
                                        <th className="py-3.5 px-4 text-xs font-black uppercase text-slate-350 tracking-wider">Blocked At</th>
                                        <th className="py-3.5 px-4 text-right text-xs font-black uppercase text-slate-350 tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850/50">
                                    {blockedIps.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-900/20 transition duration-150">
                                            <td className="py-3.5 px-4 text-xs font-bold text-white font-mono">{item.ip_address}</td>
                                            <td className="py-3.5 px-4 text-xs text-slate-400 font-semibold">{item.reason}</td>
                                            <td className="py-3.5 px-4 text-xs text-slate-500 font-semibold">{new Date(item.blocked_at).toLocaleString()}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => handleUnblockIp(item.id)}
                                                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 hover:text-white border border-slate-800 hover:border-transparent text-slate-350 rounded-lg text-[10px] font-black tracking-widest transition"
                                                >
                                                    UNBLOCK
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
                            <p className="text-slate-500 text-xs font-medium">No IP addresses are currently blocked by the firewall.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- RENDER LOGIN SCREEN ---
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
                {/* Tech Glowing Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-md bg-[#0f172a]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-left"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#194a9a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/15 text-white text-2xl border border-white/10">
                            <FaLock />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {otpRequired ? "OTP Verification" : "Admin Portal Login"}
                        </h2>
                        <p className="text-slate-400 text-xs mt-1.5 font-semibold">
                            {otpRequired 
                                ? "Enter the 6-digit verification code sent to your email" 
                                : "Enter your credentials to access the Leptis Control Center"}
                        </p>
                    </div>

                    {!otpRequired ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">Username</label>
                                <div className="flex items-center border border-slate-800 rounded-xl px-4 py-3 bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300">
                                    <FaUser className="text-slate-500 mr-3 text-xs" />
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Enter username"
                                        value={loginForm.username}
                                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                        className="w-full bg-transparent outline-none text-white text-sm placeholder-slate-650 font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">Password</label>
                                <div className="flex items-center border border-slate-800 rounded-xl px-4 py-3 bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300">
                                    <FaLock className="text-slate-500 mr-3 text-xs" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        className="w-full bg-transparent outline-none text-white text-sm placeholder-slate-650 font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-pulse">
                                    <FaExclamationTriangle className="flex-shrink-0" />
                                    <span>{loginError}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#194a9a] hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 text-sm border border-white/5"
                            >
                                Log In Securely
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div>
                                <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">Verification Code</label>
                                <div className="flex items-center border border-slate-800 rounded-xl px-4 py-3 bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300">
                                    <FaLock className="text-slate-500 mr-3 text-xs" />
                                    <input
                                        type="text"
                                        name="otp"
                                        maxLength={6}
                                        placeholder="Enter 6-digit code"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-transparent outline-none text-white text-sm placeholder-slate-650 font-semibold tracking-widest text-center font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-pulse">
                                    <FaExclamationTriangle className="flex-shrink-0" />
                                    <span>{loginError}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isVerifyingOtp}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/20 text-sm border border-white/5 disabled:opacity-50"
                            >
                                {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setOtpRequired(false);
                                    setOtpCode("");
                                    setSessionKey("");
                                    setLoginError("");
                                }}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold rounded-xl transition-all duration-300 text-xs border border-white/5"
                            >
                                Back to Username/Password
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        );
    }

    // --- RENDER LOADING SCREEN ---
    if (loadingData && !settings) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans flex flex-col md:flex-row relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-68 bg-[#0b0f19]/90 border-r border-slate-800/80 backdrop-blur-xl text-white flex flex-col justify-between p-6 md:sticky md:top-0 md:h-screen flex-shrink-0 text-left z-20">
                <div>
                    <div className="flex items-center gap-3.5 pb-6 border-b border-slate-800/60 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-[#194a9a] flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/15 border border-white/10">
                            <FaBuilding />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">Leptis Portal</h3>
                            <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mt-0.5">Control Center</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5 relative">
                        {[
                            { id: "dashboard", label: "Dashboard", icon: <FaChartBar /> },
                            { id: "applications", label: "CV Applications", icon: <FaBriefcase />, badge: applications.length },
                            { id: "messages", label: "Contact Inbox", icon: <FaEnvelope />, badge: messages.length },
                            { id: "events", label: "Manage Events", icon: <FaCalendarAlt />, badge: events.length },
                            { id: "brands", label: "Brand Logos", icon: <FaUpload />, badge: brandLogos.length },
                            { id: "projects", label: "Projects Portfolio", icon: <FaDatabase />, badge: projects.length },
                            { id: "team", label: "Our Team", icon: <FaUser />, badge: teamMembers.length },
                            { id: "branches", label: "Manage Branches", icon: <FaMapMarkerAlt />, badge: branches.length },
                            { id: "milestones", label: "About Timeline", icon: <FaCalendarAlt />, badge: milestones.length },
                            { id: "verticals", label: "About Verticals", icon: <FaBuilding />, badge: verticals.length },
                            { id: "strengths", label: "About Strengths", icon: <FaAward />, badge: strengths.length },
                            { id: "settings", label: "Site Settings", icon: <FaCog /> },
                            { id: "security", label: "Firewall Security", icon: <FaLock /> }
                        ].map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className="relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-350 text-left cursor-pointer group"
                                >
                                    {/* Active Tab Spring Slide Background */}
                                    <AnimatePresence initial={false}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeSidebarIndicator"
                                                className="absolute inset-0 bg-slate-900 border-l-2 border-amber-500 rounded-xl z-0"
                                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <span className={`relative z-10 flex items-center gap-3 transition-colors duration-300 ${
                                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                    }`}>
                                        <span className={`transition-transform duration-300 ${
                                            isActive ? "scale-110 text-amber-500" : "group-hover:scale-105"
                                        }`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </span>
                                    
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={`relative z-10 text-[9px] px-2 py-0.5 rounded-full font-black tracking-wide transition-colors duration-300 ${
                                            isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold text-rose-400 hover:text-white hover:bg-rose-600 transition-all duration-300 cursor-pointer"
                    >
                        <FaSignOutAlt className="text-xs" />
                        <span>Log Out Control</span>
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-grow p-6 sm:p-10 text-left overflow-y-auto max-w-full relative z-10 flex flex-col h-screen">
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60 mb-8 flex-shrink-0">
                    <div>
                        <span className="text-amber-500 font-extrabold text-xs uppercase tracking-widest select-none">PORTAL CONTROL</span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 capitalize text-gradient">
                            {activeTab} Overview
                        </h1>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loadingData}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl shadow-lg text-xs font-bold text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loadingData ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                <span>Syncing...</span>
                            </>
                        ) : (
                            "Refresh Data"
                        )}
                    </button>
                </header>

                <div className="flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="h-full"
                        >
                            {activeTab === "dashboard" && renderDashboardTab()}
                            {activeTab === "applications" && renderApplicationsTab()}
                            {activeTab === "messages" && renderMessagesTab()}
                            {activeTab === "events" && renderEventsTab()}
                            {activeTab === "brands" && renderBrandsTab()}
                            {activeTab === "projects" && renderProjectsTab()}
                            {activeTab === "team" && renderTeamTab()}
                            {activeTab === "branches" && renderBranchesTab()}
                            {activeTab === "milestones" && renderMilestonesTab()}
                            {activeTab === "verticals" && renderVerticalsTab()}
                            {activeTab === "strengths" && renderStrengthsTab()}
                            {activeTab === "settings" && renderSettingsTab()}
                            {activeTab === "security" && renderSecurityTab()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
