import { ArrowLeft, Check, Rocket, Share2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api'; // ✅ shared instance with token interceptor

function Dashboard() {
  const navigate = useNavigate();
  const [websites,  setWebsites]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [copiedId,  setCopiedId]  = useState(null);

  const { userData } = useSelector((s) => s.user);

  // ─── Fetch all websites ───────────────────────────────────────────────────
  useEffect(() => {
    api
      .get('/api/website/getall')
      .then((res) => setWebsites(res.data || []))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load websites.');
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Deploy ───────────────────────────────────────────────────────────────
  const handleDeploy = async (id, e) => {
    e.stopPropagation();
    try {
      const result = await api.get(`/api/website/deploy/${id}`);
      window.open(result.data.url, '_blank');
      setWebsites((prev) =>
        prev.map((w) =>
          w._id === id
            ? { ...w, deployed: true, deployUrl: result.data.url }
            : w
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Deploy failed. Please try again.');
    }
  };

  // ─── Copy share link ─────────────────────────────────────────────────────
  const handleCopy = async (site, e) => {
    e.stopPropagation();
    if (!site?.deployUrl) return;
    try {
      await navigator.clipboard.writeText(site.deployUrl);
      setCopiedId(site._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      prompt('Copy this link:', site.deployUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <button
            onClick={() => navigate('/generate')}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition"
          >
            + New Website
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm text-zinc-400 mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold">{userData?.name || 'User'}</h1>
        </motion.div>

        {/* States */}
        {loading && (
          <div className="mt-24 text-center text-zinc-400">
            Loading your websites...
          </div>
        )}

        {!loading && error && (
          <div className="mt-24 text-center text-red-400">{error}</div>
        )}

        {!loading && !error && websites.length === 0 && (
          <div className="mt-24 text-center text-zinc-400">
            <p className="mb-4">You haven't built any websites yet.</p>
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold transition"
            >
              Build your first website
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && websites.length > 0 && (
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
                  {/* Preview thumbnail */}
                  <div className="relative h-40 bg-black overflow-hidden">
                    <iframe
                      srcDoc={w.latestCode}
                      className="absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white"
                      sandbox=""
                      title={w.title}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h3 className="text-base font-semibold line-clamp-2">
                      {w.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Last updated{' '}
                      {new Date(w.updatedAt).toLocaleDateString()}
                    </p>

                    {!w.deployed ? (
                      <button
                        onClick={(e) => handleDeploy(w._id, e)}
                        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition"
                      >
                        <Rocket size={16} /> Deploy
                      </button>
                    ) : (
                      <motion.button
                        onClick={(e) => handleCopy(w, e)}
                        whileTap={{ scale: 0.95 }}
                        className={`mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                          ${
                            copied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/10 hover:bg-white/20 border border-white/10'
                          }`}
                      >
                        {copied ? (
                          <>
                            <Check size={14} /> Link Copied!
                          </>
                        ) : (
                          <>
                            <Share2 size={14} /> Share Link
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