import { ArrowRight, Sparkles, Zap, LayoutTemplate, Download } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

const Home = () => {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />

      <section className="relative min-h-screen bg-[#050505] text-white overflow-hidden">

        {/* ✅ FIX: Changed w-125/h-125 to standard Tailwind values (w-[500px]) for accurate glow rendering */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px]" />
        </div>

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff15 1px, transparent 1px), linear-gradient(to bottom, #ffffff15 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-white/10 rounded-full bg-white/5 backdrop-blur"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">
              AI Website Builder
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold leading-tight"
          >
            Build Websites with
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              AI in Seconds
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl mx-auto mt-6 text-lg text-gray-400"
          >
            Generate stunning, responsive websites instantly using AI.
            No coding required. Perfect for startups, creators and freelancers.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
          >
            <button
              type="button"
              onClick={() => navigate('/generate')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition cursor-pointer"
            >
              Start Building
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="px-6 py-3 border border-white/20 hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              Watch Demo
            </button>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">

            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-400 transition-all duration-300 cursor-pointer text-left"
            >
              <Zap className="text-yellow-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Instant Generation
              </h3>
              <p className="text-sm text-gray-400">
                Describe your website and AI generates it instantly.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-400 transition-all duration-300 cursor-pointer text-left"
            >
              <LayoutTemplate className="text-indigo-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Responsive Layout
              </h3>
              <p className="text-sm text-gray-400">
                Websites look perfect on mobile, tablet and desktop.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-400 transition-all duration-300 cursor-pointer text-left"
            >
              <Download className="text-green-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Export Code
              </h3>
              <p className="text-sm text-gray-400">
                Download clean HTML, CSS and JS instantly.
              </p>
            </motion.div>

          </div>

        </div>
      </section>
    </>
  )
}

export default Home