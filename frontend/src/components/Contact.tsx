import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Button } from './ui/Button';
export function Contact() {
  return <section id="contact" className="py-32 bg-navy-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-navy-700/40 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-sm font-bold text-electric-500 uppercase tracking-widest mb-6">
            Get in Touch
          </motion.h2>

          <motion.h3 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-50 mb-8">
            Have a project in mind?
          </motion.h3>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }} className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            I'm currently available for freelance projects and open to full-time
            opportunities. Let's build something extraordinary together.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.3
        }} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Button className="w-full sm:w-auto min-w-[160px]" onClick={() => window.location.href = 'mailto:hello@example.com'}>
              <Mail className="mr-2 h-4 w-4" />
              Say Hello
            </Button>
            <Button variant="outline" className="w-full sm:w-auto min-w-[160px]">
              Download CV
            </Button>
          </motion.div>

          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.4
        }} className="flex justify-center gap-8">
            {[{
            icon: Github,
            href: '#'
          }, {
            icon: Linkedin,
            href: '#'
          }, {
            icon: Twitter,
            href: '#'
          }].map((social, index) => <a key={index} href={social.href} className="text-slate-500 hover:text-electric-500 transition-colors duration-300">
                <social.icon size={24} />
              </a>)}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-navy-700 to-transparent" />
    </section>;
}