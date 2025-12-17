import React from 'react';
import { motion } from 'framer-motion';
import { Code, Layout, Smartphone, Zap } from 'lucide-react';
const skills = [{
  icon: Layout,
  label: 'UI/UX Design',
  desc: 'Crafting intuitive interfaces with focus on user needs.'
}, {
  icon: Code,
  label: 'Frontend Dev',
  desc: 'Building scalable applications with React & TypeScript.'
}, {
  icon: Zap,
  label: 'Performance',
  desc: 'Optimizing for speed, accessibility and SEO.'
}, {
  icon: Smartphone,
  label: 'Responsive',
  desc: 'Seamless experiences across all device sizes.'
}];
export function About() {
  return <section id="about" className="py-32 relative overflow-hidden bg-navy-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Image/Visual Column - Spans 5 columns, starts at 2 (offset) */}
          <div className="lg:col-span-5 lg:col-start-1 relative order-2 lg:order-1 mt-12 lg:mt-0">
            <motion.div initial={{
            opacity: 0,
            x: -50
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true,
            margin: '-100px'
          }} transition={{
            duration: 0.8,
            ease: 'easeOut'
          }} className="relative z-10">
              <div className="aspect-[4/5] bg-navy-800 relative overflow-hidden">
                {/* Placeholder for professional photo */}
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Portrait of developer" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating decorative element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-electric-500/20 backdrop-blur-md border border-electric-500/30 z-20 hidden md:block">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-electric-500">
                    5+
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Background decoration */}
            <div className="absolute top-12 -left-12 w-full h-full border border-navy-700 z-0 hidden lg:block" />
          </div>

          {/* Text Content - Spans 6 columns */}
          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true,
            margin: '-100px'
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="text-sm font-bold text-electric-500 uppercase tracking-widest mb-4">
                About Me
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-warm-50 mb-8 leading-tight">
                Bridging the gap between <br />
                <span className="text-slate-400">design and engineering.</span>
              </h3>

              <div className="space-y-6 text-slate-400 text-lg leading-relaxed mb-12">
                <p>
                  I believe that the best digital products are born at the
                  intersection of robust engineering and thoughtful design. With
                  a background in both disciplines, I bring a unique perspective
                  to every project.
                </p>
                <p>
                  My approach is rooted in simplicity and purpose. I don't just
                  write code; I solve problems and create experiences that feel
                  natural and intuitive to the user.
                </p>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skills.map((skill, index) => <motion.div key={index} initial={{
                opacity: 0,
                y: 20
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5,
                delay: index * 0.1
              }} className="flex items-start space-x-4">
                    <div className="p-2 bg-navy-800 rounded-lg text-electric-500">
                      <skill.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-warm-50 font-medium mb-1">
                        {skill.label}
                      </h4>
                      <p className="text-sm text-slate-500">{skill.desc}</p>
                    </div>
                  </motion.div>)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>;
}