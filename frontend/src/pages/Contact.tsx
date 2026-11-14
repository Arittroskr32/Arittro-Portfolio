import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Mail, Github, Linkedin, Twitter, Send } from 'lucide-react';
import { contactService } from '../services/contactService';

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [viaEmailApp, setViaEmailApp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await contactService.submit(formData);
      setViaEmailApp(result.mode === 'mailto');
      setIsSent(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="max-w-6xl mx-auto">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-warm-50 mb-6">
          Get In <span className="text-electric-500">Touch</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Open to collaborations, security projects and learning
          opportunities.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Contact Info */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.1
      }} className="space-y-6">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-warm-50 mb-6">Connect</h3>
            <div className="space-y-3">
              <a href="mailto:arittroskr@gmail.com" className="flex items-center gap-4 p-3 rounded-lg text-slate-400 hover:text-electric-500 hover:bg-navy-800/50 transition-all group">
                <div className="p-2 rounded-lg bg-electric-500/10 text-electric-500 group-hover:bg-electric-500/20 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="font-medium">arittroskr@gmail.com</span>
              </a>
              <a href="https://github.com/Arittroskr32" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg text-slate-400 hover:text-electric-500 hover:bg-navy-800/50 transition-all group">
                <div className="p-2 rounded-lg bg-electric-500/10 text-electric-500 group-hover:bg-electric-500/20 transition-colors">
                  <Github className="h-5 w-5" />
                </div>
                <span className="font-medium">github.com/Arittroskr32</span>
              </a>
              <a href="https://www.linkedin.com/in/arittro-sarkar-01780a301/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg text-slate-400 hover:text-electric-500 hover:bg-navy-800/50 transition-all group">
                <div className="p-2 rounded-lg bg-electric-500/10 text-electric-500 group-hover:bg-electric-500/20 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </div>
                <span className="font-medium">linkedin.com/in/arittro-sarkar</span>
              </a>
              <a href="https://x.com/arittroskr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg text-slate-400 hover:text-electric-500 hover:bg-navy-800/50 transition-all group">
                <div className="p-2 rounded-lg bg-electric-500/10 text-electric-500 group-hover:bg-electric-500/20 transition-colors">
                  <Twitter className="h-5 w-5" />
                </div>
                <span className="font-medium">@arittroskr</span>
              </a>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-electric-500/10 to-navy-800/50 p-8 border border-electric-500/20">
            <h4 className="font-bold text-warm-50 mb-3 text-lg">
              Looking for a CTF collaborator, security projects?
            </h4>
            <p className="text-slate-400">
              I'm always interested in joining. Feel free to reach out!
            </p>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.2
      }}>
          <Card className="p-8 lg:p-10">
            {isSent ? <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-warm-50 mb-2">
                  {viaEmailApp ? 'Almost there!' : 'Message Sent!'}
                </h3>
                <p className="text-slate-400">
                  {viaEmailApp
                    ? 'Your email app has opened with the message filled in. Press send there and I will get back to you as soon as possible.'
                    : "Thanks for reaching out. I'll get back to you as soon as possible."}
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setIsSent(false)}>
                  Send Another
                </Button>
              </div> : <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Name" 
                  placeholder="Your name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
                <Input 
                  label="Email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required 
                />
                <Textarea 
                  label="Message" 
                  placeholder="What's on your mind?" 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required 
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>}
          </Card>
        </motion.div>
      </div>
    </div>;
}