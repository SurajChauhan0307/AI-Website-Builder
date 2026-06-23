// ✅ FIX #3: All requests now use the shared `api` instance from api.js
//    which attaches the Authorization: Bearer <token> header automatically.
//    Previously this file used raw axios — causing 401 Unauthorized on
//    all update / deploy / getbyid calls.
import api from "../api";
import { Code2, MessageSquare, Monitor, Rocket, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";

const WebsiteEditor = () => {
  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const { id } = useParams();
  const iframeRef = useRef(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const thinkingSteps = [
    "Understanding your request...",
    "Planning layout changes...",
    "Improving responsiveness...",
    "Applying animations...",
    "Finalizing update...",
  ];

  useEffect(() => {
    if (!updateLoading) return;
    const intervalId = setInterval(() => {
      setThinkingIndex((i) => (i + 1) % thinkingSteps.length);
    }, 1200);
    return () => clearInterval(intervalId);
  }, [updateLoading]);

  // ✅ Uses api instance — token attached automatically
  const handleDeploy = async () => {
    try {
      const result = await api.get(`/api/website/deploy/${website._id}`);
      window.open(result.data.url, "_blank");
      setWebsite((prev) => ({
        ...prev,
        deployed: true,
        deployUrl: result.data.url,
      }));
    } catch (err) {
      console.error("Deploy error:", err);
      alert(err.response?.data?.message || "Deploy failed. Please try again.");
    }
  };

  // ✅ Uses api instance — token attached automatically
  const handleUpdate = async () => {
    if (!prompt.trim() || updateLoading) return;

    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setUpdateLoading(true);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const result = await api.post(`/api/website/update/${id}`, {
        prompt: currentPrompt,
      });

      setMessages((m) => [
        ...m,
        { role: "ai", content: result.data.message },
      ]);
      setCode(result.data.code);
    } catch (err) {
      console.error("Update error:", err);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content:
            err.response?.data?.message ||
            "Update failed. Please try again.",
        },
      ]);
    } finally {
      setUpdateLoading(false);
    }
  };

  // ✅ Uses api instance — token attached automatically
  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await api.get(`/api/website/getbyid/${id}`);
        setWebsite(result.data);
        setCode(result.data.latestCode);
        setMessages(result.data.conversation);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
        console.error("Fetch website error:", err);
      }
    };
    handleGetWebsite();
  }, [id]);

  useEffect(() => {
    if (!iframeRef.current || !code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [code]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUpdate();
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );
  }

  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-95 flex-col border-r border-white/10 bg-black/80">
        <Header />

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed 
                ${m.role === "user"
                    ? "bg-white text-black"
                    : "bg-white/5 border border-white/10 text-zinc-200"
                  }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {updateLoading && (
            <div className="max-w-[85%] mr-auto">
              <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">
                {thinkingSteps[thinkingIndex]}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Describe changes... (Enter to send)"
              className="flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
            />
            <button
              disabled={updateLoading || !prompt.trim()}
              onClick={handleUpdate}
              className="px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-40 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* PREVIEW */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80">
          <span className="text-xs text-zinc-400">Live Preview</span>

          <div className="flex gap-2">
            {!website.deployed ? (
              <button
                onClick={handleDeploy}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition"
              >
                <Rocket size={14} /> Deploy
              </button>
            ) : (
              <a
                href={website.deployUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600/80 text-sm font-semibold hover:scale-105 transition"
              >
                <Rocket size={14} /> View Live
              </a>
            )}

            <button onClick={() => setShowChat(true)} className="p-2 lg:hidden">
              <MessageSquare size={18} />
            </button>

            <button onClick={() => setShowCode(true)} className="p-2">
              <Code2 size={18} />
            </button>

            <button onClick={() => setShowFullPreview(true)} className="p-2">
              <Monitor size={18} />
            </button>
          </div>
        </div>

        <iframe
          ref={iframeRef}
          className="flex-1 w-full bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* MOBILE CHAT */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[9999] flex flex-col bg-black"
          >
            <Header />

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed 
                    ${m.role === "user"
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/10 text-zinc-200"
                      }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {updateLoading && (
                <div className="max-w-[85%] mr-auto">
                  <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">
                    {thinkingSteps[thinkingIndex]}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Describe changes..."
                className="flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
              />
              <button
                disabled={updateLoading || !prompt.trim()}
                onClick={handleUpdate}
                className="px-4 py-3 bg-white text-black rounded-2xl disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CODE PANEL */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] flex flex-col bg-[#1e1e1e]"
          >
            <div className="h-12 px-4 flex justify-between items-center border-b border-white/10">
              <span className="text-sm font-medium">index.html</span>
              <button onClick={() => setShowCode(false)}>
                <X size={18} />
              </button>
            </div>
            <Editor
              theme="vs-dark"
              value={code}
              language="html"
              onChange={(v) => setCode(v || "")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL PREVIEW */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div className="fixed inset-0 bg-black z-[9999]">
            <iframe
              className="w-full h-full bg-white"
              srcDoc={code}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 p-2 bg-black/70 rounded-lg"
            >
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function Header() {
    return (
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
        <span className="font-semibold truncate">{website.title}</span>
        <button onClick={() => setShowChat(false)} className="lg:hidden">
          <X />
        </button>
      </div>
    );
  }
};

export default WebsiteEditor;