import React, { useState, useEffect } from "react";
import {
  PenTool,
  Trash2,
  User,
  LogOut,
  ChevronRight,
  Plus,
  ArrowLeft,
  Loader2,
  BookOpen,
  Calendar,
  Activity,
  Terminal,
} from "lucide-react";
import profileIcon from "./profile2.png";
import myBackground from "./myBg.jpg";


const API_BASE_URL = "http://localhost:4000";







// --- API HELPER ---
/**
 * A reusable asynchronous wrapper for `fetch` to handle API communication.
 * - Manages HTTP methods (GET, POST, PUT, DELETE).
 * - Automatically attaches the 'Authorization' header if a token is provided.
 * - Parses JSON responses and handles HTTP errors globally.
 */
const apiCall = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Error ${response.status}`);
  }

  // --- THE FIX: Handle 204 No Content (Delete Success) ---
  // Returns an empty object if the server successfully processed a request but returned no content (common in DELETE operations).
  if (response.status === 204) {
    return {};
  }
  // ------------------------------------------------------

  return await response.json();
};








// --- STYLES & ANIMATIONS ---
// (CSS Styles skipped as per instructions)
const globalStyles = `
  /* IMPORTING FONTS: Playfair Display (Titles) + Merriweather (Body - Uniform Numbers) */
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');

  /* Font Classes */
  .font-newspaper-title { 
    font-family: 'Playfair Display', serif; 
    font-variant-numeric: lining-nums; /* Ensures numbers align */
  }
  .font-newspaper-body { 
    font-family: 'Merriweather', serif; 
    font-variant-numeric: lining-nums; /* Ensures numbers align */
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .glass-panel {
    background: rgba(17, 24, 39, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(75, 85, 99, 0.4);
  }
  
  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0c0a09; }
  ::-webkit-scrollbar-thumb { background: #44403c; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #57534e; }
`;

// --- COMPONENTS ---

// 1. Authentication Component
/**
 * Handles user Login and Registration.
 * - Toggles between "Login" and "Register" modes.
 * - Submits credentials to the backend.
 * - Calls `onLogin` prop upon successful authentication to update parent state.
 */
const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles form submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Determines endpoint based on toggle state
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const data = await apiCall(endpoint, "POST", { username, password });
      // Passes token and user info back to App component
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 text-gray-100 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${myBackground})`,
      }}
    >
      <style>{globalStyles}</style>

      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative z-10 glass-panel w-full max-w-md overflow-hidden rounded-sm shadow-2xl animate-slide-up p-10 border-t-4 border-teal-600">
        <div className="text-center">
          <h2 className="font-newspaper-title text-4xl font-bold italic tracking-wide text-gray-100 mb-2">
            {isLogin ? "The Daily Log" : "New Subscription"}
          </h2>
          <div className="h-px w-24 bg-gray-600 mx-auto my-4"></div>
          <p className="font-newspaper-body text-gray-400 italic">
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
                className="font-newspaper-body block w-full bg-gray-900 border-b border-gray-600 p-3 text-lg text-gray-100 placeholder-gray-700 focus:border-teal-500 focus:outline-none transition-colors"
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
                className="font-newspaper-body block w-full bg-gray-900 border-b border-gray-600 p-3 text-lg text-gray-100 placeholder-gray-700 focus:border-teal-500 focus:outline-none transition-colors"
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
            className="group font-newspaper-title text-lg relative flex w-full justify-center bg-gray-100 py-3 font-bold text-gray-900 hover:bg-teal-500 hover:text-white disabled:opacity-50 transition-all duration-300"
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

        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-newspaper-body text-sm text-gray-500 hover:text-teal-400 hover:underline underline-offset-4 transition-colors italic"
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

// 2. Blog List Component
/**
 * Displays the list of all published blogs.
 * - Receives `blogs` array as a prop.
 * - Renders a grid of blog cards.
 * - Handles navigation to the single blog view via `onView`.
 */
const BlogList = ({ blogs, onView }) => {
  return (
    <div className="space-y-12 animate-slide-up max-w-8xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center border-b-4 border-double border-gray-700 pb-8">
        <h1 className="font-newspaper-title text-6xl md:text-7xl font-bold text-white tracking-tight mb-4">
          ROOT        ACCESS
        </h1>
        <div className="flex items-center justify-center space-x-4 text-teal-500 font-sans text-xs tracking-widest uppercase">
          <span className="h-px w-8 bg-teal-800"></span>
          <span font-newspaper-title text-lg text-white italic>
            Unfiltered writes to the main branch
          </span>
          <span className="h-px w-8 bg-teal-800"></span>
        </div>
      </div>

      {/* Conditional Rendering: Show message if no blogs, else map through array */}
      {blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center opacity-60">
          <div className="font-newspaper-title text-2xl text-gray-500 italic">
            "Silence is the ultimate weapon of power."
          </div>
          <p className="font-sans text-xs mt-2 text-gray-600 uppercase tracking-widest">
            No entries found
          </p>
        </div>
      ) : (
        <div className="grid gap-px bg-gray-800 border-t border-b border-gray-800">
          {blogs.map((blog, idx) => (
            <div
              key={blog.id}
              onClick={() => onView(blog.id)}
              className="group relative flex flex-col md:flex-row md:items-baseline md:justify-between cursor-pointer bg-gray-950 p-8 transition-all duration-300 hover:bg-gray-900"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Date Column */}
              <div className="font-newspaper-body text-sm font-bold text-gray-500 mb-2 md:mb-0 md:w-32 flex-shrink-0 group-hover:text-teal-500 transition-colors">
                {new Date(blog.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {/* Title */}
              <h3 className="font-newspaper-title text-3xl md:text-4xl text-gray-200 group-hover:text-white group-hover:underline decoration-1 underline-offset-8 decoration-teal-600/50 transition-all flex-grow pr-8">
                {blog.title}
              </h3>

              {/* Arrow */}
              <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                <ChevronRight className="h-6 w-6 text-teal-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Single Blog Reader
/**
 * Displays the full content of a specific blog post.
 * - Fetches specific blog data by `id` on mount.
 * - Handles loading and empty states.
 * - Renders the blog title, metadata (author, date), and content body.
 */
const BlogReader = ({ id, onBack, token }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch individual blog details when ID or Token changes
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await apiCall(`/api/blogs/${id}`, "GET", null, token);
        setBlog(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, token]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  if (!blog)
    return (
      <div className="p-12 text-center font-newspaper-title text-2xl text-gray-500">
        Page intentionally left blank.
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl animate-slide-up px-4">
      {/* Navigation: Back Button */}
      <button
        onClick={onBack}
        className="group mb-12 flex items-center text-xs font-sans font-bold uppercase tracking-widest text-gray-500 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Back to Front Page
      </button>

      <article>
        {/* Article Header */}
        <header className="mb-10 text-center">
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 border border-teal-900 text-teal-500 text-[10px] uppercase tracking-widest font-sans">
              Opinion & Editorial
            </span>
          </div>
          <h1 className="font-newspaper-title text-5xl md:text-6xl font-medium leading-tight text-gray-100 mb-8">
            {blog.title}
          </h1>

          <div className="flex items-center justify-center space-x-6 border-y border-gray-800 py-4 font-sans text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="flex items-center">
  <span className="font-newspaper-body text-sm">
    By {blog.author_name}
  </span>
</div>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <div className="flex items-center">
              {/* Uses font-newspaper-body now for uniform dates */}
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

        {/* Article Body: Maps new lines to paragraphs for proper formatting */}
        <div className="font-newspaper-body text-xl leading-relaxed text-gray-300 space-y-6 first-letter:text-6xl first-letter:font-bold first-letter:text-teal-500 first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]">
          {blog.content
            .split("\n")
            .map((paragraph, idx) =>
              paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
            )}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <div className="inline-block px-4 py-2 bg-gray-900 rounded-sm">
            <p className="font-sans text-[10px] uppercase tracking-widest text-gray-600">
              End of Blog
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

// 4. Admin Dashboard (CRUD)
/**
 * Allows Admin users to Manage Blogs.
 * - Lists user-specific blogs (Read).
 * - Create new blogs (Create).
 * - Edit existing blogs (Update).
 * - Delete blogs (Delete).
 * - Toggles between 'List View' and 'Editor View'.
 */
const AdminDashboard = ({ token, user, onViewPost }) => {
  const [blogs, setBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({
    title: "",
    content: "",
    published: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch blogs created by the logged-in admin
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

  // Handle deletion of a blog post
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this record?")) return;
    try {
      await apiCall(`/api/blogs/${id}`, "DELETE", null, token);
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Handle Form Submission for Creating or Updating
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentBlog.id) {
        // Update existing blog
        await apiCall(
          `/api/blogs/${currentBlog.id}`,
          "PUT",
          currentBlog,
          token
        );
      } else {
        // Create new blog
        await apiCall("/api/blogs", "POST", currentBlog, token);
      }
      setIsEditing(false);
      setCurrentBlog({ title: "", content: "", published: false });
      fetchBlogs(); // Refresh list
    } catch (err) {
      alert("Save failed");
    }
  };

  // Render: Editor View (Form)
  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl animate-slide-up">
        <button
          onClick={() => setIsEditing(false)}
          className="mb-8 flex items-center text-xs font-sans font-bold uppercase tracking-widest text-gray-500 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-3 w-3" /> Cancel
        </button>

        <div className="bg-gray-900 p-8 border border-gray-800">
          <h2 className="font-newspaper-title text-3xl mb-8 text-white italic">
            {currentBlog.id ? "Edit Manuscript" : "Draft New Piece"}
          </h2>
          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="mb-2 block text-xs font-sans font-bold uppercase tracking-widest text-gray-500">
                Headline
              </label>
              <input
                className="font-newspaper-title block w-full bg-gray-950 border border-gray-800 p-4 text-2xl text-white focus:border-teal-600 focus:outline-none transition-all"
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
                className="font-newspaper-body block h-96 w-full bg-gray-950 border border-gray-800 p-4 text-lg text-gray-300 focus:border-teal-600 focus:outline-none transition-all leading-relaxed"
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

  // Render: Dashboard Table View
  return (
    <div className="mx-auto max-w-6xl animate-slide-up px-4">
  <div className="mb-10 flex items-end justify-between border-b-2 border-gray-800 pb-4">
    <div>
      <h1 className="font-newspaper-title text-4xl text-white italic">
        Editor's Desk
      </h1>
    </div>
    <button
      onClick={() => {
        setCurrentBlog({ title: "", content: "", published: false });
        setIsEditing(true);
      }}
      className="flex items-center bg-gray-100 px-6 py-3 font-sans text-xs font-bold uppercase tracking-widest text-black hover:bg-teal-500 hover:text-white transition-colors"
    >
      <Plus className="mr-2 h-4 w-4" /> New Article
    </button>
  </div>

  {loading ? (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
    </div>
  ) : (
    <div className="overflow-hidden border border-gray-800">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-900">
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
        <tbody className="divide-y divide-gray-800 bg-gray-950">
          {blogs.map((blog) => (
            <tr
              key={blog.id}
              className="hover:bg-gray-900 transition-colors"
            >
              <td className="px-6 py-4 font-newspaper-title text-xl text-white">
                {blog.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-newspaper-body text-sm text-gray-500">
                {new Date(blog.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-4">
                  {/* View Button */}
                  <button
                    onClick={() => onViewPost(blog.id)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                  {/* Edit Button */}
                  <button
                    onClick={() => {
                      setCurrentBlog(blog);
                      setIsEditing(true);
                    }}
                    className="text-teal-600 hover:text-teal-400 transition-colors"
                  >
                    <PenTool className="h-4 w-4" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
  );
};

// --- MAIN APP ---
/**
 * Main Application Container.
 * - Manages global state: Authentication Token, User User, Current View.
 * - Handles routing logic (switch between Auth, Home, Article, Admin).
 * - Manages Login/Logout persistence.
 */
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [activeBlogId, setActiveBlogId] = useState(null);
  const [blogs, setBlogs] = useState([]);

  // On initialization, verify token and fetch user details
  useEffect(() => {
    if (token) {
      apiCall("/api/auth/me", "GET", null, token)
        .then((userData) => setUser(userData))
        .catch(() => handleLogout()); // Force logout if token is invalid
    }
    fetchBlogs();
  }, [token]);

  // Fetch all public blogs for the Home view
  const fetchBlogs = async () => {
    try {
      const data = await apiCall("/api/blogs");
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    }
  };

  // Set state after successful login
  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    setView("home");
    fetchBlogs();
  };

  // Clear state and storage on logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setView("home");
  };

  // Conditional Return: If not authenticated, show Auth component
  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  // View Routing Logic: Determines which component to render
  let content;
  if (view === "article") {
    content = (
      <BlogReader
        id={activeBlogId}
        token={token}
        onBack={() => setView("home")}
      />
    );
  } else if (view === "admin" && user?.role === "admin") {
    content = (
      <AdminDashboard
        token={token}
        user={user}
        onViewPost={(id) => {
          setActiveBlogId(id);
          setView("article");
        }}
      />
    );
  } else {
    // Default view: Blog List
    content = (
      <BlogList
        blogs={blogs}
        isAdmin={user?.role === "admin"}
        onView={(id) => {
          setActiveBlogId(id);
          setView("article");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-300 selection:bg-teal-900 selection:text-white">
      <style>{globalStyles}</style>

      {/* Navbar Component */}
      <nav className="sticky top-0 z-50 border-b border-gray-900 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            {/* Logo area - Resets to Home view on click */}
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => {
                setView("home");
                fetchBlogs(); // refetch blogs
              }}
            >
              <div className="mr-4 flex h-10 w-10 items-center justify-center bg-white text-black font-newspaper-title text-2xl font-bold">
                B
              </div>
              <span className="font-newspaper-title text-2xl font-bold tracking-tight text-white group-hover:text-teal-500 transition-colors">
                BLOGHUB
              </span>
            </div>

            {/* Right Side Actions: User Info & Logout */}
            <div className="flex items-center space-x-8">
              {user && (
                <>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="font-sans text-xs font-bold uppercase tracking-widest text-gray-400">
                      Signed in as
                    </span>
                    <span className="font-newspaper-title text-lg text-white italic">
                      {user.username}
                    </span>
                  </div>

                  {/* Admin Button: Only visible if user has 'admin' role */}
                  {user.role === "admin" && (
                    <button
                      onClick={() => setView("admin")}
                      className={`relative transition-all hover:opacity-80 ${
                        view === "admin" ? "opacity-100" : "opacity-60"
                      }`}
                    >
                      <img
                        src={profileIcon}
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

      {/* Main Content Area: Renders variable content based on 'view' state */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {content}
      </main>
    </div>
  );
}