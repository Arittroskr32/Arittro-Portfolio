import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/Button';
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const yGraphic = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  return <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-electric-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-navy-800/50 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content - Spans 8 columns for asymmetry */}
          <motion.div style={{
          y: yText,
          opacity
        }} className="lg:col-span-8 lg:col-start-1">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}>
              <span className="inline-block py-1 px-3 rounded-full bg-navy-800 border border-navy-700 text-electric-500 text-xs font-semibold tracking-wider uppercase mb-6">
                Available for freelance
              </span>
            </motion.div>

            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1]
          }} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-warm-50 mb-8 leading-[1.1]">
              Crafting digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-white">
                experiences
              </span>{' '}
              that matter.
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1]
          }} className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              I'm a creative developer and designer focused on building brands
              and products with purpose. Specializing in interactive design,
              motion, and scalable frontend architecture.
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }} className="flex flex-wrap gap-4">
              <Button withArrow onClick={() => document.getElementById('projects')?.scrollIntoView()}>
                View Selected Work
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView()}>
                Contact Me
              </Button>
            </motion.div>
          </motion.div>

          {/* Decorative Graphic - Asymmetric placement */}
          <motion.div style={{
          y: yGraphic
        }} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 1,
          delay: 0.4,
          ease: 'easeOut'
        }} className="hidden lg:block lg:col-span-4 lg:col-start-9 relative">
            <div className="relative w-full aspect-[3/4] border border-navy-700 bg-navy-800/30 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-500/20 to-transparent opacity-50" />
              {/* Abstract geometric shapes */}
              <div className="absolute top-10 left-10 w-20 h-20 border border-electric-500/30 rounded-full" />
              <div className="absolute bottom-20 right-10 w-32 h-32 border border-warm-200/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-electric-500/10 rotate-45" />

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                      Current Status
                    </p>
                    <p className="text-sm font-medium text-electric-500">
                      Open to opportunities
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-electric-500 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1,
      duration: 1
    }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-electric-500 to-transparent" />
      </motion.div>
    </section>;
}