import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api'; // ✅ shared instance with token interceptor
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const PHASES = [
  'Analyzing your idea...',
  'Designing layout and structure...',
  'Writing HTML and CSS...',
  'Adding animation and interaction...',
  'Final quality checks...',
];

const Generate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [prompt,     setPrompt]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error,      setError]      = useState('');

  const { userData } = useSelector((s) => s.user);

  const handleGenerateWebsite = async () => {
    if (!prompt.trim() || loading) return;

    try {
      setLoading(true);
      setError('');
      setProgress(0);

      const res = await api.post('/api/website/generate', { prompt });

      setProgress(100);

      if (res.data?.remainingCredits !== undefined) {
        dispatch(setUserData({ ...userData, credits: res.data.remainingCredits }));
      }

      setTimeout(() => navigate(`/editor/${res.data.websiteId}`), 500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Generation failed. Please check your connection and try again.';
      setError(msg);
      setLoading(false);
    }
  };

  // Fake progress animation while loading
  useEffect(() => {
    if (!loading) {
      setPhaseIndex(0);
      setProgress(0);
      return;
    }

    let value = 0;
    const interval = setInterval(() => {
      const step =
        value < 20 ? Math.random() * 1.5
        : value < 60 ? Math.random() * 1.2
        : Math.random() * 0.4;

      value = Math.min(value + step, 98);
      const phase = Math.min(
        Math.floor((value / 100) * PHASES.length),
        PHASES.length - 1
      );
      setProgress(Math.floor(value));
      setPhaseIndex(phase);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-white/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-semibold ml-4">Promptic AI</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Build Website with
            <span className="block bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Real AI Power
            </span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Describe your website in detail — the more specific you are, the
            better the result.
          </p>
        </motion.div>

        {/* Credits warning */}
        {userData?.credits !== undefined && userData.credits < 10 && (
          <div className="mb-6 text-center">
            <p className="text-yellow-400 text-sm">
              You only have {userData.credits} credits.{' '}
              <span
                className="underline cursor-pointer"
                onClick={() => navigate('/pricing')}
              >
                Top up here
              </span>
            </p>
          </div>
        )}

        {/* Input */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">
            Describe Your Website
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full h-56 p-6 rounded-3xl bg-black/60 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:ring-2 focus:ring-white/20 disabled:opacity-50"
            placeholder="e.g. A modern portfolio site for a graphic designer with a dark theme, hero section, project gallery, and contact form."
          />
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleGenerateWebsite}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            disabled={!prompt.trim() || loading}
            className={`px-14 py-4 rounded-2xl font-semibold text-lg transition ${
              prompt.trim() && !loading
                ? 'bg-white text-black'
                : 'bg-white/20 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Website'}
          </motion.button>
        </div>

        {/* Progress */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto mt-12"
          >
            <div className="flex justify-between mb-2 text-xs text-zinc-400">
              <span>{PHASES[phaseIndex]}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.8 }}
                className="h-full bg-gradient-to-r from-white to-zinc-300"
              />
            </div>
            <div className="text-center text-xs text-zinc-400 mt-4">
              AI is building your site — this takes{' '}
              <span className="text-white font-medium">1–3 minutes</span>. Please
              don't close this tab.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Generate;