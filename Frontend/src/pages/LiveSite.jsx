// PUBLIC page — no login required. Anyone with the link can view it.
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BASE_URL =
  import.meta.env.VITE_SERVER_URL ||
  'https://ai-website-builder-d0n1.onrender.com';

const LiveSite = () => {
  const [html,    setHtml]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ FIX: param name matches App.jsx route "/site/:slug"
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) {
      setError('No site identifier in URL.');
      setLoading(false);
      return;
    }

    // ✅ Plain fetch — no axios, no credentials, fully public
    fetch(`${BASE_URL}/api/website/getbyslug/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data?.latestCode) {
          setHtml(data.latestCode);
        } else {
          setError('This site has no content.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Site not found or not yet deployed.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-sm">
        Loading site...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4 px-6 text-center">
        <p className="text-red-400">{error}</p>
        <a href="/" className="text-indigo-400 underline text-sm">
          ← Back to home
        </a>
      </div>
    );
  }

  return (
    <iframe
      title="Live Site"
      srcDoc={html}
      className="w-screen h-screen border-none"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
};

export default LiveSite;