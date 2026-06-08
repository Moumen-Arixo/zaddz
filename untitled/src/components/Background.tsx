import { motion } from "motion/react";

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-dark-900">
      {/* Top Right Orb - Cyan */}
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[120px]"
      />

      {/* Bottom Left Orb - Gold */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-accent-500/15 blur-[100px]"
      />

      {/* Center Orb - Green/Blueish */}
      <motion.div
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] left-[30%] w-[35%] h-[35%] rounded-full bg-teal-500/10 blur-[90px]"
      />

      {/* Floating Glass Particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: "-20vh",
            opacity: [0, 0.8, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "linear",
          }}
          className={`absolute w-${16 + i * 4} h-${16 + i * 4} bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm`}
          style={{
            left: `${15 + i * 25}%`,
          }}
        />
      ))}
    </div>
  );
}
