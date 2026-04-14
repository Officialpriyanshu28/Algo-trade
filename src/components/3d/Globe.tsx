import { motion } from "motion/react";

export default function Globe() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      
      {/* Main sphere */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative w-64 h-64 rounded-full border border-cyan-500/30 bg-slate-950/50 backdrop-blur-sm shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden"
      >
        {/* Grid lines */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: `
            linear-gradient(to right, rgba(34,211,238,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34,211,238,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          transform: 'perspective(500px) rotateX(60deg) scale(2)',
          transformOrigin: 'center center'
        }} />
        
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 rounded-full" />
        
        {/* Equator line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      </motion.div>
    </div>
  );
}
