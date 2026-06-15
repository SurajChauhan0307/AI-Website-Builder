import { ArrowLeft, Check, Rocket, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; 
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const { userData } = useSelector((state) => state.user);

  // ✅ Production safe fallback string url alignment to stop any undefined router paths
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-website-builder-d0n1.onrender.com';

  // ================= DEPLOY =================
  const handleDeploy = async (id) => {
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL endpoint context missing");

      const result = await axios.get(
        `${API_BASE_URL}/api/website/deploy/${id}`,
        { withCredentials: true }
      );

      window.open(result.data.url, "_blank");

      setWebsites((prev) =>
        prev.map((w) =>
          w._id === id
            ? { ...w, deployed: true, deployUrl: result.data.url }
            : w
        )
      );
    } catch (error) {
      console.error("❌ Dashboard Deploy tracking sequence crashed:", error.response?.data || error.message);
    }
  };

  // ================= FETCH WEBSITES =================
  useEffect(() => {
    const handleGetAllWebsite = async () => {
      try {
        setLoading(true);
        setError(""); 

        const result = await axios.get(
          `${API_BASE_URL}/api/website/getall`,
          { withCredentials: true }
        );

        setWebsites(result.data || []);
      } catch (error) {
        console.error("❌ Fetching live project directory array failed:", error.response?.data || error.message);
        setError(error.response?.data?.message || "Failed to load generated profiles from the live server.");
      } finally {
        setLoading(false);
      }
    };

    handleGetAllWebsite();
  }, []); 

  // ================= COPY =================
  const handleCopy = async (site) => {
    if (!site?.deployUrl) return;

    await navigator.clipboard.writeText(site.deployUrl);
    setCopiedId(site._id);

    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <button
            onClick={() => navigate("/generate")}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition"
          >
            + New Website
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm text-zinc-400 mb-1">Welcome Back</p>
          <h1 className="text-3xl font-bold">{userData?.name || "User"}</h1>
        </motion.div>

        {loading && (
          <div className="mt-24 text-center text-zinc-400 animate-pulse">Loading dashboards...</div>
        )}

        {error && !loading && (
          <div className="mt-24 text-center text-red-400 border border-red-500/20 bg-red-500/5 max-w-md mx-auto py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && websites.length === 0 && (
          <div className="mt-24 text-center text-zinc-500 text-sm">
            No websites generated yet. Click "+ New Website" to launch your template engine.
          </div>
        )}

        {/* GRID */}
        {!loading && !error && websites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {websites.map((w, i) => {
              const copied = copiedId === w._id;

              return (
                <motion.div
                  key={w._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/editor/${w._id}`)}
                  className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col cursor-pointer"
                >
                  <div className="relative h-40 bg-black">
                    <iframe
                      srcDoc={w.latestCode}
                      title={w.title}
                      className="absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <h3 className="text-base font-semibold">{w.title || "Untitled AI Project"}</h3>

                    <p className="text-xs text-zinc-400">
                      Last Updated {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : "Recently"}
                    </p>

                    {!w.deployed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleDeploy(w._id);
                        }}
                        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 transition"
                      >
                        <Rocket size={18} />
                        Deploy Layout
                      </button>
                    ) : (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleCopy(w);
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all 
                          ${
                            copied
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 hover:bg-white/20 border border-white/10"
                          }`}
                      >
                        {copied ? (
                          <>
                            <Check size={14} /> Link Copied
                          </>
                        ) : (
                          <>
                            <Share2 size={14} /> Share Production
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;