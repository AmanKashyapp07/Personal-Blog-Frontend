import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  PenTool,
  Trash2,
  ChevronRight,
  Plus,
  ArrowLeft,
  Loader2,
  BookOpen,
  MessageSquare,
  Send,
  Search,
  X,
  Lightbulb,
  Share2,
  Copy,
  Check,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";


// --- IMAGES ---
import profileIcon from "./profile2.png";
import darkProfileIcon from "./dark_.png";

import myBackground from "./myBg.jpg";

// --- ENV ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// --- THEME CONTEXT ---
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // Check local storage or default to dark (original theme)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// --- API HELPER ---
const apiCall = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    headers,
  };

  // Only add body if it exists AND method is not GET/DELETE
  if (body && method !== "GET" && method !== "DELETE") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Error ${response.status}`);
  }

  if (response.status === 204) {
    return {};
  }

  return await response.json();
};

// --- STYLES ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');

  .font-newspaper-title { 
    font-family: 'Playfair Display', serif; 
    font-variant-numeric: lining-nums;
  }
  .font-newspaper-body { 
    font-family: 'Merriweather', serif; 
    font-variant-numeric: lining-nums;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  /* Dynamic Glass Panel based on theme handled in components via classes, 
     but keeping base definition here */
  .glass-panel {
    backdrop-filter: blur(12px);
  }
  
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0c0a09; }
  ::-webkit-scrollbar-thumb { background: #44403c; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #57534e; }
`;

// --- COMPONENTS ---

// 1. Authentication
const Auth = ({ onLogin }) => {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const data = await apiCall(endpoint, "POST", { username, password });
      onLogin(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Theme Styles
  const glassClass = theme === "dark" 
    ? "bg-gray-900/85 border-gray-700/40 text-gray-100" 
    : "bg-white/90 border-stone-300 text-stone-900 shadow-xl";
  
  const inputClass = theme === "dark"
    ? "bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-700"
    : "bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400";

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 text-gray-100 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${myBackground})` }}
    >
      <style>{globalStyles}</style>
      <div className={`absolute inset-0 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/20' : 'bg-stone-200/20'}`}></div>
      
      <div className={`relative z-10 glass-panel w-full max-w-md overflow-hidden rounded-sm shadow-2xl animate-slide-up p-10 border-t-4 border-teal-600 ${glassClass} border-x border-b`}>
        <div className="text-center">
          <h2 className={`font-newspaper-title text-4xl font-bold italic tracking-wide mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-stone-900'}`}>
            {isLogin ? "The Daily Log" : "New Subscription"}
          </h2>
          <div className="h-px w-24 bg-teal-600 mx-auto my-4"></div>
          <p className={`font-newspaper-body italic ${theme === 'dark' ? 'text-gray-400' : 'text-stone-500'}`}>
            {isLogin
              ? "Please identify yourself."
              : "Join our readership today."}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500 font-sans">
                Username
              </label>
              <input
                type="text"
                required
                className={`font-newspaper-body block w-full border-b p-3 text-lg focus:border-teal-500 focus:outline-none transition-colors ${inputClass}`}
                placeholder="Enter alias..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500 font-sans">
                Password
              </label>
              <input
                type="password"
                required
                className={`font-newspaper-body block w-full border-b p-3 text-lg focus:border-teal-500 focus:outline-none transition-colors ${inputClass}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="font-newspaper-body italic text-red-400 text-center text-sm border-l-2 border-red-500 pl-3 py-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`group font-newspaper-title text-lg relative flex w-full justify-center py-3 font-bold disabled:opacity-50 transition-all duration-300 ${
              theme === 'dark' 
              ? "bg-gray-100 text-gray-900 hover:bg-teal-500 hover:text-white" 
              : "bg-stone-900 text-stone-50 hover:bg-teal-600 hover:text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : isLogin ? (
              "Access Archives"
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className={`mt-8 text-center border-t pt-6 ${theme === 'dark' ? 'border-gray-800' : 'border-stone-200'}`}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-newspaper-body text-sm text-gray-500 hover:text-teal-500 hover:underline underline-offset-4 transition-colors italic"
          >
            {isLogin
              ? "No credentials? Apply here."
              : "Already subscribed? Login."}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Blog List (Redesigned Search)
const BlogList = ({ blogs }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Theme Styles
  const headerBorder = theme === 'dark' ? 'border-gray-800' : 'border-stone-300';
  const mainTitleColor = theme === 'dark' ? 'text-white' : 'text-stone-900';
  const subTitleColor = theme === 'dark' ? 'text-gray-400' : 'text-stone-500';
  
  const searchInputClass = theme === 'dark'
    ? "bg-gray-950/80 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:bg-black"
    : "bg-white/80 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:bg-white shadow-sm";

  const cardClass = theme === 'dark'
    ? "bg-gray-950 hover:bg-gray-900 text-gray-300 hover:text-white border-gray-800"
    : "bg-white hover:bg-stone-50 text-stone-700 hover:text-black border-stone-200";

  return (
    <div className="animate-slide-up max-w-8xl mx-auto px-4 pb-20">
      {/* --- HEADER SECTION --- */}
      <div className={`relative border-b-4 border-double pb-12 mb-12 pt-8 ${headerBorder}`}>
        {/* Main Title */}
        <div className="text-center mb-10">
          <h1 className={`font-newspaper-title text-6xl md:text-8xl font-bold tracking-tighter mb-4 drop-shadow-2xl ${mainTitleColor}`}>
            JOURNAL
          </h1>

          <div className="flex items-center justify-center space-x-4 text-teal-600 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
            <span className="h-px w-12 bg-teal-800"></span>
            <span className={`font-newspaper-body italic ${subTitleColor}`}>
              The Unfiltered Archive
            </span>
            <span className="h-px w-12 bg-teal-800"></span>
          </div>
        </div>

        {/* New Centered Search Bar */}
        <div className="max-w-2xl mx-auto relative group z-10">
          <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
            {/* Search Icon */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
            </div>

            {/* The Input Field */}
            <input
              type="text"
              placeholder="Search by headline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full backdrop-blur-md border pl-14 pr-12 py-4 rounded-sm shadow-2xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all font-newspaper-body text-lg placeholder:italic ${searchInputClass}`}
            />

            {/* Clear Button (X) */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-teal-500 rounded-full transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- SEARCH RESULTS FEEDBACK --- */}
      {searchTerm && (
        <div className="text-center mb-8 animate-slide-up">
          <span className="inline-block px-3 py-1 border border-teal-900/50 bg-teal-900/10 rounded-full font-sans text-[10px] font-bold text-teal-600 uppercase tracking-widest">
            Found {filteredBlogs.length} Article
            {filteredBlogs.length !== 1 && "s"}
          </span>
        </div>
      )}

      {/* --- BLOG GRID --- */}
      {filteredBlogs.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 text-center opacity-60 border border-dashed rounded-lg ${theme === 'dark' ? 'bg-gray-900/30 border-gray-800' : 'bg-stone-200/30 border-stone-300'}`}>
          <div className="font-newspaper-title text-3xl text-gray-500 italic mb-2">
            {searchTerm ? "No matching records." : "The archives are empty."}
          </div>
          <p className="font-sans text-xs text-gray-600 uppercase tracking-widest">
            {searchTerm ? "Try a broader keyword" : "Check back later"}
          </p>
        </div>
      ) : (
        <div className={`grid gap-px border-t border-b shadow-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-800' : 'bg-stone-300 border-stone-200'}`}>
          {filteredBlogs.map((blog, idx) => (
            <div
              key={blog.id}
              onClick={() => navigate(`/blog/${blog.id}`)}
              // Changed p-8 to py-6 px-8 to reduce height. Added items-center for vertical centering.
              className={`group relative flex flex-col md:flex-row items-center md:justify-between cursor-pointer py-6 px-8 transition-all duration-300 hover:pl-10 ${cardClass}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Left Meta Column: Date & Author */}
              <div className="mb-2 md:mb-0 md:w-40 flex-shrink-0 flex flex-col">
                <div className="font-newspaper-body text-sm font-bold text-gray-500 group-hover:text-teal-600 transition-colors">
                  {new Date(blog.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                {/* Author Name */}
                <div className={`text-[10px] font-sans uppercase tracking-widest mt-1 opacity-80 ${theme === 'dark' ? 'text-gray-500' : 'text-stone-500'}`}>
                   {blog.author_name || "Contributor"}
                </div>
              </div>

              {/* Title */}
              <h3 className={`font-newspaper-title text-3xl md:text-4xl group-hover:underline decoration-1 underline-offset-8 decoration-teal-600/50 transition-all flex-grow pr-8 leading-tight ${theme === 'dark' ? 'group-hover:text-white' : 'group-hover:text-black'}`}>
                {blog.title}
              </h3>

              {/* Arrow Icon */}
              <div className="hidden md:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-20px] group-hover:translate-x-0 w-12">
                <ChevronRight className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Blog Reader
const BlogReader = ({ token, currentUser }) => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  // Blog State
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comment State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Share State
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Blog
        const blogData = await apiCall(`/api/blogs/${id}`, "GET", null, token);
        setBlog(blogData);

        // Fetch Comments
        const commentsData = await apiCall(`/api/blogs/${id}/comments`, "GET", null, token);
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await apiCall(`/api/blogs/${id}/comments`, "POST", { content: newComment }, token);
      const updatedComments = await apiCall(`/api/blogs/${id}/comments`, "GET", null, token);
      setComments(updatedComments);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(commentId);
    try {
      await apiCall(`/api/blogs/${id}/comments/${commentId}`, "DELETE", null, token);
      setComments((prev) => prev.filter((c) => Number(c.id) !== Number(commentId)));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBlogAuthor = useMemo(() => {
    if (!currentUser || !blog) return false;
    return Number(blog.author_id) === Number(currentUser.id);
  }, [currentUser, blog]);
  
  // Theme Helpers
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-stone-800';
  const headingColor = theme === 'dark' ? 'text-gray-100' : 'text-stone-900';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-stone-300';
  const commentBg = theme === 'dark' ? 'bg-gray-900/50' : 'bg-stone-200/50';
  const inputBg = theme === 'dark' ? 'bg-gray-950 text-gray-300' : 'bg-white text-stone-900';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-12 text-center font-newspaper-title text-2xl text-gray-500">
        Page intentionally left blank (Blog not found).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-slide-up px-4 pb-20 relative">
      {/* --- Navigation --- */}
      <button
        onClick={() => navigate("/")}
        className="group mb-12 flex items-center text-xs font-sans font-bold uppercase tracking-widest text-gray-500 hover:text-teal-500 transition-colors"
      >
        <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Back to Front Page
      </button>

      {/* --- Blog Article --- */}
      <article className="mb-16">
        <header className="mb-10 text-center">
          <div className="flex justify-center mb-6">
            <span className={`px-3 py-1 border text-teal-600 text-[10px] uppercase tracking-widest font-sans ${theme === 'dark' ? 'border-teal-900' : 'border-teal-200 bg-teal-50'}`}>
              Opinion & Editorial
            </span>
          </div>
          <h1 className={`font-newspaper-title text-5xl md:text-6xl font-medium leading-tight mb-8 ${headingColor}`}>
            {blog.title}
          </h1>

          <div className={`flex items-center justify-center space-x-6 border-y py-4 font-sans text-xs font-bold uppercase tracking-widest text-gray-500 ${borderColor}`}>
            <div className="flex items-center">
              <span className="font-newspaper-body text-sm">
                By {blog.author_name}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center">
              <span className="font-newspaper-body text-sm">
                {new Date(blog.created_at).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        <div className={`font-newspaper-body text-xl leading-relaxed space-y-6 first-letter:text-6xl first-letter:font-bold first-letter:text-teal-600 first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] ${textColor}`}>
          {blog.content
            .split("\n")
            .map((paragraph, idx) =>
              paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
            )}
        </div>

        <div className={`mt-16 pt-8 border-t text-center ${borderColor}`}>
          <div className={`inline-block px-4 py-2 rounded-sm ${theme === 'dark' ? 'bg-gray-900' : 'bg-stone-200'}`}>
            <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500">
              End of Blog
            </p>
          </div>
          
          {/* --- UPDATED: Share Button Container (Relative for Popover) --- */}
          <div className="mt-8 flex justify-center relative z-20">
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-all font-sans text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>

            {/* --- UPDATED: Popover Share Menu (Absolute Position) --- */}
            {showShare && (
              <div className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[350px] max-w-[90vw] rounded-xl shadow-2xl overflow-hidden animate-slide-up origin-bottom ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                
                {/* Popover Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}>
                  <h3 className={`font-sans font-bold text-sm ${headingColor}`}>Share this story</h3>
                  <button 
                    onClick={() => setShowShare(false)}
                    className="p-1 rounded-full hover:bg-gray-200/20 text-gray-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Social Icons */}
                <div className="p-4">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                    {[
                      { icon: <Facebook className="w-5 h-5" />, bg: "bg-blue-600", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                      { icon: <Twitter className="w-4 h-4" />, bg: "bg-black", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}` },
                      { icon: <Linkedin className="w-4 h-4" />, bg: "bg-blue-700", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}` },
                      { icon: <MessageSquare className="w-4 h-4" />, bg: "bg-green-500", url: `https://wa.me/?text=${encodeURIComponent(blog.title + " " + window.location.href)}` },
                      { icon: <LinkIcon className="w-4 h-4" />, bg: "bg-gray-500", url: `mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(window.location.href)}` },
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110 ${item.bg}`}
                      >
                        {item.icon}
                      </a>
                    ))}
                  </div>

                  {/* Copy Link Input */}
                  <div className={`mt-4 p-1 rounded-md border flex items-center ${theme === 'dark' ? 'bg-gray-950 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex-1 px-3 py-1 overflow-hidden">
                      <p className={`text-xs truncate font-mono ${textColor}`}>{window.location.href}</p>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors flex items-center gap-1 m-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                
                {/* Arrow at bottom of popover */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}></div>
              </div>
            )}
          </div>

        </div>
      </article>

      {/* --- Comments Section --- */}
      <section className={`max-w-3xl mx-auto mt-12 pt-12 border-t ${borderColor}`}>
        <div className="flex items-center gap-3 mb-8 text-teal-600">
          <MessageSquare className="w-5 h-5" />
          <h3 className={`font-newspaper-title text-2xl ${headingColor}`}>
            Reader Commentary
          </h3>
          <span className="text-gray-500 text-sm font-sans ml-2">
            ({comments.length})
          </span>
        </div>

        {/* Comment Form */}
        <form
          onSubmit={handlePostComment}
          className={`mb-12 p-6 rounded border ${commentBg} ${borderColor}`}
        >
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Add your voice
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a respectful comment..."
            className={`w-full border rounded p-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-newspaper-body text-lg min-h-[100px] resize-y placeholder:text-gray-500 ${inputBg} ${borderColor}`}
            required
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-teal-800/10 text-teal-600 border border-teal-600/30 rounded hover:bg-teal-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest"
            >
              {submittingComment ? (
                <>Processing...</>
              ) : (
                <>
                  Post Comment <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-8">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center italic font-newspaper-body">
              No comments yet. Be the first to share your thoughts.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="group animate-slide-up relative">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-teal-600 font-sans font-bold text-xs uppercase tracking-wider">
                      @{comment.username}
                    </h4>
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest font-sans">
                      {new Date(comment.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {/* --- DELETE BUTTON --- */}
                  {isBlogAuthor && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete this comment"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                <div className={`pl-4 border-l-2 group-hover:border-teal-600 transition-colors ${borderColor}`}>
                  <p className={`font-newspaper-body text-lg leading-relaxed ${textColor}`}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

// 4. Admin Dashboard
const AdminDashboard = ({ token, user }) => {
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({
    title: "",
    content: "",
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- NEW: Share State ---
  const [activeShareId, setActiveShareId] = useState(null); // Track which blog's share menu is open
  const [copied, setCopied] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiCall("/api/blogs/my", "GET", null, token);
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (!token) {
    alert("You are not authenticated");
    return;
  }
  
  const handleDelete = async (id) => {
    console.log("DELETE TOKEN:", token);
    if (!window.confirm("Permanently remove this record?")) return;
    try {
      await apiCall(`/api/blogs/${id}`, "DELETE", null, token);
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentBlog.id) {
        await apiCall(
          `/api/blogs/${currentBlog.id}`,
          "PUT",
          currentBlog,
          token
        );
      } else {
        await apiCall("/api/blogs", "POST", currentBlog, token);
      }
      setIsEditing(false);
      setCurrentBlog({ title: "", content: "", published: false });
      fetchBlogs();
    } catch (err) {
      alert("Save failed");
    }
  };

  // --- NEW: Share Logic ---
  const handleCopyLink = (blogId) => {
    // Construct the specific URL for this blog
    const url = `${window.location.origin}/blog/${blogId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Theme Styles
  const bgPanel = theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-stone-200 shadow-xl';
  const headingColor = theme === 'dark' ? 'text-white' : 'text-stone-900';
  const inputBg = theme === 'dark' 
    ? "bg-gray-950 border-gray-800 text-white" 
    : "bg-stone-50 border-stone-300 text-stone-900";
  const tableHeaderBg = theme === 'dark' ? 'bg-gray-900' : 'bg-stone-100';
  const tableBodyBg = theme === 'dark' ? 'bg-gray-950' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-stone-200';
  // New Styles for Share Popover
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-stone-800';

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl animate-slide-up">
        <button
          onClick={() => setIsEditing(false)}
          className="mb-8 flex items-center text-xs font-sans font-bold uppercase tracking-widest text-gray-500 hover:text-teal-500"
        >
          <ArrowLeft className="mr-2 h-3 w-3" /> Cancel
        </button>

        <div className={`p-8 border ${bgPanel}`}>
          <h2 className={`font-newspaper-title text-3xl mb-8 italic ${headingColor}`}>
            {currentBlog.id ? "Edit Manuscript" : "Draft New Piece"}
          </h2>
          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="mb-2 block text-xs font-sans font-bold uppercase tracking-widest text-gray-500">
                Headline
              </label>
              <input
                className={`font-newspaper-title block w-full border p-4 text-2xl focus:border-teal-600 focus:outline-none transition-all ${inputBg}`}
                value={currentBlog.title}
                onChange={(e) =>
                  setCurrentBlog({ ...currentBlog, title: e.target.value })
                }
                required
                placeholder="An Attention-Grabbing Title"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-sans font-bold uppercase tracking-widest text-gray-500">
                Body Copy
              </label>
              <textarea
                className={`font-newspaper-body block h-96 w-full border p-4 text-lg focus:border-teal-600 focus:outline-none transition-all leading-relaxed ${inputBg}`}
                value={currentBlog.content}
                onChange={(e) =>
                  setCurrentBlog({ ...currentBlog, content: e.target.value })
                }
                required
                placeholder="Start your article here..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-700 py-4 font-sans text-xs font-bold uppercase tracking-widest text-white hover:bg-teal-600 transition-colors"
            >
              {currentBlog.id ? "Update Record" : "Publish"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-slide-up px-4 pb-20">
      <div className={`mb-10 flex items-end justify-between border-b-2 pb-4 ${borderColor}`}>
        <div>
          <h1 className={`font-newspaper-title text-4xl italic ${headingColor}`}>
            Editor's Desk
          </h1>
        </div>
        <button
          onClick={() => {
            setCurrentBlog({ title: "", content: "", published: false });
            setIsEditing(true);
          }}
          className={`flex items-center px-6 py-3 font-sans text-xs font-bold uppercase tracking-widest transition-colors ${theme === 'dark' ? 'bg-gray-100 text-black hover:bg-teal-500 hover:text-white' : 'bg-stone-900 text-white hover:bg-teal-600'}`}
        >
          <Plus className="mr-2 h-4 w-4" /> New Article
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : (
        // Changed overflow-hidden to visible so share popup isn't cut off
        <div className={`overflow-visible border ${borderColor}`}>
          <table className={`min-w-full divide-y ${borderColor}`}>
            <thead className={tableHeaderBg}>
              <tr>
                <th className="px-6 py-4 text-left font-sans text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Headline
                </th>
                <th className="px-6 py-4 text-left font-sans text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-right font-sans text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderColor} ${tableBodyBg}`}>
              {blogs.map((blog) => {
                // Generate share URL for this specific row
                const shareUrl = `${window.location.origin}/blog/${blog.id}`;

                return (
                  <tr
                    key={blog.id}
                    className={`transition-colors ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-stone-50'}`}
                  >
                    <td className={`px-6 py-4 font-newspaper-title text-xl ${headingColor}`}>
                      {blog.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-newspaper-body text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <div className="flex justify-end items-center space-x-4">
                        
                        {/* --- NEW: Share Button & Popover --- */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveShareId(activeShareId === blog.id ? null : blog.id)}
                            className="text-gray-400 hover:text-teal-600 transition-colors pt-1"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>

                          {/* Popover Menu */}
                          {activeShareId === blog.id && (
                            <div className={`absolute bottom-full mb-2 right-0 z-50 w-[300px] rounded-xl shadow-2xl overflow-hidden animate-slide-up origin-bottom-right border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-stone-200'}`}>
                              
                              <div className={`flex items-center justify-between px-4 py-2 border-b ${borderColor}`}>
                                <h3 className={`font-sans font-bold text-[10px] uppercase tracking-widest ${headingColor}`}>Share</h3>
                                <button 
                                  onClick={() => setActiveShareId(null)}
                                  className="p-1 rounded-full hover:bg-gray-200/20 text-gray-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="p-4">
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                  {[
                                    { icon: <Facebook className="w-4 h-4" />, bg: "bg-blue-600", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
                                    { icon: <Twitter className="w-3 h-3" />, bg: "bg-black", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}` },
                                    { icon: <Linkedin className="w-3 h-3" />, bg: "bg-blue-700", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
                                    { icon: <LinkIcon className="w-3 h-3" />, bg: "bg-gray-500", url: `mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(shareUrl)}` },
                                  ].map((item, idx) => (
                                    <a
                                      key={idx}
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110 ${item.bg}`}
                                    >
                                      {item.icon}
                                    </a>
                                  ))}
                                </div>

                                <div className={`mt-3 p-1 rounded border flex items-center ${theme === 'dark' ? 'bg-gray-950 border-gray-700' : 'bg-gray-50 border-stone-200'}`}>
                                  <div className="flex-1 px-2 overflow-hidden">
                                    <p className={`text-[10px] truncate font-mono ${textColor}`}>{shareUrl}</p>
                                  </div>
                                  <button
                                    onClick={() => handleCopyLink(blog.id)}
                                    className="p-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                                  >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Existing Actions */}
                        <button
                          onClick={() => navigate(`/blog/${blog.id}`)}
                          className="text-gray-500 hover:text-teal-500 transition-colors"
                          title="Read"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentBlog(blog);
                            setIsEditing(true);
                          }}
                          className="text-teal-600 hover:text-teal-400 transition-colors"
                          title="Edit"
                        >
                          <PenTool className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-700 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- LAYOUT ---
const Layout = ({ children, user, handleLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const layoutBg = theme === 'dark' ? 'bg-gray-950 text-gray-300' : 'bg-stone-50 text-stone-800';
  const navBg = theme === 'dark' ? 'border-gray-900 bg-gray-950/90' : 'border-stone-200 bg-white/90';
  const logoBg = theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white';
  const logoText = theme === 'dark' ? 'text-white' : 'text-black';

  return (
    <div className={`min-h-screen font-sans selection:bg-teal-900 selection:text-white ${layoutBg}`}>
      <style>{globalStyles}</style>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${navBg}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className={`mr-4 flex h-10 w-10 items-center justify-center font-newspaper-title text-2xl font-bold ${logoBg}`}>
                B
              </div>
              <span className={`font-newspaper-title text-2xl font-bold tracking-tight group-hover:text-teal-500 transition-colors ${logoText}`}>
                BLOGHUB
              </span>
            </div>

            <div className="flex items-center space-x-8">
              {/* --- LIGHT THEME TOGGLE ICON --- */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-teal-500/10 transition-colors group"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <Lightbulb className={`h-5 w-5 transition-all ${theme === 'dark' ? 'text-gray-400 group-hover:text-yellow-300' : 'text-amber-500 fill-amber-500 group-hover:text-amber-600'}`} />
              </button>

              {user && (
                <>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="font-sans text-xs font-bold uppercase tracking-widest text-gray-400">
                      Signed in as
                    </span>
                    <span className={`font-newspaper-title text-lg italic ${logoText}`}>
                      {user.username}
                    </span>
                  </div>

                  {user.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className={`relative transition-all hover:opacity-80 ${
                        location.pathname === "/admin"
                          ? "opacity-100"
                          : "opacity-60"
                      }`}
                    >
                      <img
                        src={theme === 'dark' ? profileIcon : darkProfileIcon}
                        alt="Admin"
                        className="h-10 w-10 rounded-sm object-cover grayscale hover:grayscale-0 transition-all"
                      />
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="font-sans text-xs font-bold uppercase tracking-widest text-red-900 hover:text-red-500 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

// --- MAIN LOGIC ---
const MainApp = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      apiCall("/api/auth/me", "GET", null, token)
        .then((userData) => setUser(userData))
        .catch(() => handleLogout());
    }
  }, [token]);

  const fetchBlogs = async () => {
    try {
      const data = await apiCall("/api/blogs");
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [location.pathname]);

  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Auth onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout user={user} handleLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} />} />
        <Route path="/blog/:id" element={<BlogReader token={token} currentUser={user}/>} />
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard token={token} user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// --- ROOT APP ---
export default function App() {
  return (
    // Wrapped in ThemeProvider to access theme context throughout the app
    <ThemeProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </ThemeProvider>
  );
}