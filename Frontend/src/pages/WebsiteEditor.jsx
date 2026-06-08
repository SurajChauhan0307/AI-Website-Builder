import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Code2, MessageSquare, Monitor, Rocket, Send, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Editor from '@monaco-editor/react'

const WebsiteEditor = () => {
    const { id } = useParams()
    const iframeRef = useRef(null)
    const messagesEndRef = useRef(null)

    const [website, setWebsite] = useState(null)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")
    const [messages, setMessages] = useState([])
    const [prompt, setPrompt] = useState("")
    
    const [updateLoading, setUpdateLoading] = useState(false)
    const [deployLoading, setDeployLoading] = useState(false)
    const [thinkingIndex, setThinkingIndex] = useState(0)
    
    const [showCode, setShowCode] = useState(false)
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [showChat, setShowChat] = useState(false)

    const thinkingSteps = [
        "Understanding your request...",
        "Planning layout changes...",
        "Improving responsiveness...",
        "Applying animations...",
        "Finalizing Update..."
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        })
    }, [messages, updateLoading])

    useEffect(() => {
        if (!updateLoading) return
        const intervalId = setInterval(() => {
            setThinkingIndex((i) => (i + 1) % thinkingSteps.length)
        }, 1200)
        return () => clearInterval(intervalId)
    }, [updateLoading])

    useEffect(() => {
        if (!iframeRef.current || !code) return
        iframeRef.current.srcdoc = code
    }, [code])

    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/website/getbyid/${id}`, 
                    { withCredentials: true }
                )
                setWebsite(result.data)
                setCode(result.data.latestCode)
                setMessages(result.data.conversation || [])
            } catch (error) {
                setError(
                    error?.response?.data?.message || 
                    "Failed to load website"
                )
                console.error(error)
            }
        }
        handleGetWebsite()
    }, [id])

    const handleDeploy = async () => {
        if (deployLoading) return

        try {
            setDeployLoading(true)
            const result = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/website/deploy/${website._id}`,
                { withCredentials: true }
            )

            setWebsite(prev => ({
                ...prev,
                deployed: true
            }))

            window.open(result.data.url, "_blank")
        } catch (error) {
            console.error(error)
        } finally {
            setDeployLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!prompt.trim()) return

        const currentPrompt = prompt
        setPrompt("")
        setMessages(m => [
            ...m,
            {
                role: "user",
                content: currentPrompt
            }
        ])

        setUpdateLoading(true)

        try {
            const result = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/website/update/${id}`,
                { prompt: currentPrompt },
                { withCredentials: true }
            )

            setMessages(m => [
                ...m,
                {
                    role: "ai",
                    content: result.data.message || "Website updated successfully."
                }
            ])

            setCode(result.data.code)
            
            if (result.data.remainingCredits !== undefined) {
                setWebsite(prev => ({
                    ...prev,
                    remainingCredits: result.data.remainingCredits
                }))
            }
        } catch (error) {
            console.log("STATUS:", error.response?.status)
            console.log("DATA:", error.response?.data)

            setMessages(m => [
                ...m,
                {
                    role: "ai",
                    content: error.response?.data?.message || "Something went wrong."
                }
            ])
        } finally {
            setUpdateLoading(false)
        }
    }

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>{error}</div>
        )
    }

    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-white'>Loading...</div>
        )
    }

    return (
        <div className='h-screen w-screen flex bg-black text-white overflow-hidden'>
            <aside className='hidden lg:flex w-96 flex-col border-r border-white/10 bg-black/80'>
                <Header />
                <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                    {messages.map((m, i) => (
                        <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                m.role === "user" ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-200"
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {updateLoading && (
                        <div className='max-w-[85%] mr-auto'>
                            <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>
                                {thinkingSteps[thinkingIndex]}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className='p-3 border-t border-white/10'>
                    <div className='flex gap-2'>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleUpdate()
                                }
                            }}
                            rows={1}
                            placeholder='Describe changes...'
                            className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20' 
                        />
                        <button disabled={updateLoading} onClick={handleUpdate} className='px-4 py-3 rounded-2xl bg-white text-black'>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            <div className='flex-1 flex flex-col'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                    <span className='text-xs text-zinc-400'>Live Preview</span>
                    <div className='flex gap-2'>
                        {website.deployed ? "" : (
                            <button
                                onClick={handleDeploy}
                                disabled={deployLoading}
                                className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <Rocket size={14} />
                                {deployLoading ? "Deploying..." : "Deploy"}
                            </button>
                        )}
                        <button onClick={() => setShowChat(true)} className='p-2 lg:hidden'><MessageSquare size={18} /></button>
                        <button onClick={() => setShowCode(true)} className='p-2'><Code2 size={18} /></button>
                        <button onClick={() => setShowFullPreview(true)} className='p-2'><Monitor size={18} /></button>
                    </div>
                </div>
                <iframe ref={iframeRef} className='flex-1 w-full bg-white' sandbox='allow-scripts allow-forms' title="Live View Sandbox"/>
            </div>

            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className='fixed inset-0 z-[9999] flex flex-col bg-black'
                    >
                        <Header />
                        <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                            {messages.map((m, i) => (
                                <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        m.role === "user" ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-200"
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {updateLoading && (
                                <div className='max-w-[85%] mr-auto'>
                                    <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>
                                        {thinkingSteps[thinkingIndex]}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className='p-3 border-t border-white/10'>
                            <div className='flex gap-2'>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleUpdate()
                                        }
                                    }}
                                    rows={1}
                                    placeholder='Describe changes...'
                                    className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20' 
                                />
                                <button disabled={updateLoading} onClick={handleUpdate} className='px-4 py-3 rounded-2xl bg-white text-black'>
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className='fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] flex flex-col bg-[#1e1e1e]'
                    >
                        <div className='h-12 px-4 flex justify-between items-center border-b border-white/10 bg-[#1e1e1e]'>
                            <span className='text-sm font-medium'>index.html</span>
                            <button onClick={() => setShowCode(false)}><X size={18} /></button>
                        </div>
                        <Editor 
                            theme='vs-dark' 
                            value={code} 
                            language='html' 
                            onChange={(v) => setCode(v || "")} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (
                    <motion.div className='fixed inset-0 bg-black z-[9999]'>
                        <iframe className='w-full h-full bg-white' srcDoc={code} sandbox='allow-scripts allow-forms' title="Full Preview Panel" />
                        <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg'><X /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )

    function Header() {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-white/10'>
                <div className='flex flex-col min-w-0'>
                    <span className='font-semibold truncate text-sm'>{website.title}</span>
                    <p className='text-xs text-zinc-400'>
                        Credits: {website.remainingCredits ?? 0}
                    </p>
                </div>
                <button onClick={() => setShowChat(false)} className='lg:hidden text-zinc-400 hover:text-white'><X size={18}/></button>
            </div>
        )
    }
}

export default WebsiteEditor