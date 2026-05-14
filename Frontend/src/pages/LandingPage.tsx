import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Flame, 
  Timer, 
  CheckCircle2, 
  BarChart3, 
  Trophy, 
  Moon, 
  ArrowRight,
  Star,
  Zap,
  Globe,
  Smartphone,
  Heart
} from 'lucide-react';

const FEATURES = [
  { icon: <Timer size={28} />, title: "Focus Timer", desc: "Scientific Pomodoro sessions designed to minimize distractions.", color: "#7C3AED" },
  { icon: <CheckCircle2 size={28} />, title: "Task Manager", desc: "Intuitive priority system that helps you tackle what matters first.", color: "#EC4899" },
  { icon: <Flame size={28} />, title: "Habit Tracker", desc: "Build unbreakable streaks with visual momentum indicators.", color: "#F59E0B" },
  { icon: <BarChart3 size={28} />, title: "Analytics", desc: "Deep insights into your study patterns and productivity peaks.", color: "#10B981" },
  { icon: <Trophy size={28} />, title: "Badges", desc: "Stay motivated by earning unique rewards for your consistency.", color: "#3B82F6" },
  { icon: <Moon size={28} />, title: "Dark Mode", desc: "Beautiful high-contrast theme for late-night study sessions.", color: "#6366F1" }
];

const STEPS = [
  { number: "01", title: "Join the Flow", desc: "Create your student profile and connect with a smarter way of studying." },
  { number: "02", title: "Map Your Success", desc: "Input your syllabus, habits, and goals into your personal dashboard." },
  { number: "03", title: "Crush Your Goals", desc: "Use the focus timer and track your progress as you hit milestones." }
];

const STUDY_TIPS = [
  { title: "Pomodoro Technique", tag: "Focus", desc: "Study for 25 mins, break for 5. Keep your brain fresh and agile." },
  { title: "Active Recall", tag: "Memory", desc: "Test yourself instead of just reading. It's the #1 way to learn." },
  { title: "Sleep Optimization", tag: "Wellness", desc: "Your brain consolidates memory while you sleep. Prioritize rest." },
  { title: "Cornell Formatting", tag: "Note Taking", desc: "A systematic format for condensing and organizing complex notes." },
  { title: "Eat The Frog", tag: "Productivity", desc: "Tackle your most daunting task first to build early momentum." },
  { title: "Interleaving Study", tag: "Memory", desc: "Mix different subjects in one session to improve problem-solving." }
];

const TESTIMONIALS = [
  { text: "Routineo completely changed my exam prep. I went from scattered to structured in just a week.", author: "Priya Sharma", role: "Engineering @ IIT", avatar: "P" },
  { text: "The habit tracker is addictive! I've been on a 45-day study streak and my focus has never been better.", author: "Arjun Mehta", role: "Medical Student", avatar: "A" },
  { text: "Clean, fast, and actually built for how students work. Finally, a tool that isn't bloated.", author: "Sara Khan", role: "Design Student", avatar: "S" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function LandingPage() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Focus", "Memory", "Wellness", "Productivity", "Note Taking"];

  const filteredTips = filter === "All" 
    ? STUDY_TIPS 
    : STUDY_TIPS.filter(tip => tip.tag === filter);

  return (
    <div className="landing-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .landing-root { font-family: 'Inter', sans-serif; color: #0F172A; background: #FFFFFF; overflow-x: hidden; }
        h1, h2, h3, .font-outfit { font-family: 'Outfit', sans-serif; }
        .max-width { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .navbar { position: fixed; top: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(241, 245, 249, 0.8); height: 80px; display: flex; align-items: center; z-index: 1000; }
        .navbar-content { width: 100%; display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.5rem; color: #0F172A; text-decoration: none; }
        .logo-icon { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: white; padding: 8px; border-radius: 12px; display: flex; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
        .nav-links { display: flex; gap: 12px; align-items: center; }
        .btn { padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-ghost { color: #64748B; }
        .btn-ghost:hover { color: #7C3AED; background: #F8FAFC; }
        .btn-solid { background: #7C3AED; color: white; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3); }
        .btn-solid:hover { background: #6D28D9; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4); }
        .hero-section { padding: 160px 0 100px; position: relative; }
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #F5F3FF; color: #7C3AED; padding: 8px 16px; border-radius: 100px; font-size: 0.875rem; font-weight: 700; margin-bottom: 24px; border: 1px solid #DDD6FE; }
        .hero-title { font-size: 4.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.04em; background: linear-gradient(135deg, #0F172A 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { font-size: 1.25rem; color: #64748B; line-height: 1.6; margin-bottom: 40px; max-width: 540px; }
        .hero-image-wrapper { position: relative; }
        .hero-image { width: 100%; border-radius: 32px; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15); border: 8px solid white; transform: rotate(2deg); }
        .floating-card { position: absolute; background: white; padding: 20px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #F1F5F9; display: flex; align-items: center; gap: 12px; animation: float 4s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .card-1 { top: -20px; right: -20px; animation-delay: 0s; }
        .card-2 { bottom: 40px; left: -30px; animation-delay: 2s; }
        .trust-bar { padding: 40px 0; border-top: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; text-align: center; }
        .trust-text { font-size: 0.875rem; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }
        .trust-logos { display: flex; justify-content: center; gap: 48px; filter: grayscale(1); opacity: 0.6; flex-wrap: wrap; }
        .section-header { text-align: center; margin-bottom: 64px; }
        .section-title { font-size: 3rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em; }
        .section-subtitle { color: #64748B; font-size: 1.125rem; max-width: 600px; margin: 0 auto; }
        .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { padding: 40px; border-radius: 24px; background: white; border: 1px solid #F1F5F9; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .feature-card:hover { transform: translateY(-8px); border-color: rgba(124, 58, 237, 0.2); box-shadow: 0 20px 40px -12px rgba(124, 58, 237, 0.1); }
        .feature-icon-box { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; transition: transform 0.3s; }
        .feature-card:hover .feature-icon-box { transform: scale(1.1) rotate(5deg); }
        .feature-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; }
        .feature-desc { color: #64748B; line-height: 1.6; font-size: 0.95rem; }
        .steps-section { background: #F8FAFC; padding: 100px 0; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-top: 60px; }
        .step-card { text-align: center; position: relative; }
        .step-number { font-size: 6rem; font-weight: 900; color: rgba(124, 58, 237, 0.05); position: absolute; top: -40px; left: 50%; transform: translateX(-50%); z-index: 1; pointer-events: none; }
        .step-content { position: relative; z-index: 2; }
        .step-icon-circle { width: 64px; height: 64px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); color: #7C3AED; }
        .filter-buttons { display: flex; justify-content: center; gap: 12px; margin-bottom: 48px; flex-wrap: wrap; }
        .filter-tag { padding: 8px 20px; border-radius: 100px; font-weight: 700; font-size: 0.875rem; background: #F1F5F9; color: #64748B; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
        .filter-tag.active { background: #7C3AED; color: white; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
        .tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .tip-card { padding: 32px; background: white; border-radius: 24px; border: 1px solid #F1F5F9; transition: all 0.3s; }
        .tip-card:hover { border-color: #7C3AED; background: #F5F3FF; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .testimonial-card { padding: 40px; background: white; border-radius: 24px; border: 1px solid #F1F5F9; display: flex; flex-direction: column; }
        .avatar-circle { width: 48px; height: 48px; border-radius: 50%; background: #7C3AED; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 24px; }
        .cta-section { padding: 80px 0; }
        .cta-box { background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); border-radius: 40px; padding: 80px 40px; text-align: center; color: white; position: relative; overflow: hidden; }
        .cta-image-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.15; pointer-events: none; object-fit: cover; }
        .footer { background: #0F172A; color: white; padding: 100px 0 60px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 80px; margin-bottom: 60px; }
        .footer-logo-text { color: white; font-size: 1.5rem; margin-bottom: 24px; }
        .footer-desc { color: #94A3B8; line-height: 1.6; max-width: 320px; }
        .footer-heading { font-weight: 700; font-size: 1.125rem; margin-bottom: 24px; color: white; }
        .footer-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .footer-link { color: #94A3B8; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: white; }
        .footer-bottom { padding-top: 40px; border-top: 1px solid #1E293B; display: flex; justify-content: space-between; align-items: center; color: #64748B; font-size: 0.875rem; }
        @media (max-width: 1024px) { .hero-grid { grid-template-columns: 1fr; text-align: center; gap: 80px; } .hero-desc { margin: 0 auto 40px; } .feature-grid, .steps-grid, .tips-grid, .testimonials-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .hero-title { font-size: 3.25rem; } .feature-grid, .steps-grid, .tips-grid, .testimonials-grid { grid-template-columns: 1fr; } .footer-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; } .footer-desc { margin: 0 auto; } .footer-bottom { flex-direction: column; gap: 20px; } }
      `}</style>

      <nav className="navbar">
        <div className="max-width navbar-content">
          <Link to="/" className="logo">
            <div className="logo-icon"><Flame size={24} /></div>
            <span className="font-outfit">Routineo</span>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/login" className="btn btn-solid">Get Started <ArrowRight size={18} /></Link>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="max-width hero-grid">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="hero-badge"><Zap size={14} fill="#7C3AED" /> Built for the modern student</div>
            <h1 className="hero-title">Study Smarter,<br />Not Harder.</h1>
            <p className="hero-desc">The all-in-one productivity suite designed specifically for academic excellence. Track tasks, build habits, and master your time.</p>
            <div className="nav-links">
              <Link to="/login" className="btn btn-solid" style={{ padding: '16px 36px', fontSize: '1.125rem' }}>Get Started Free</Link>
              <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 700 }}>View Demo</Link>
            </div>
          </motion.div>
          <motion.div className="hero-image-wrapper" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <img src="/hero_student.png" alt="Student productivity" className="hero-image" />
            <div className="floating-card card-1"><div style={{ background: '#10B981', padding: '6px', borderRadius: '8px', color: 'white' }}><CheckCircle2 size={20} /></div><div><p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '2px' }}>TASK COMPLETED</p><p style={{ fontSize: '0.875rem', fontWeight: 800 }}>Calc Assignment</p></div></div>
            <div className="floating-card card-2"><div style={{ background: '#F59E0B', padding: '6px', borderRadius: '8px', color: 'white' }}><Flame size={20} /></div><div><p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '2px' }}>HABIT STREAK</p><p style={{ fontSize: '0.875rem', fontWeight: 800 }}>14 Days 🔥</p></div></div>
          </motion.div>
        </div>
      </header>

      <div className="trust-bar">
        <div className="max-width">
          <p className="trust-text">Powering success at top universities</p>
          <div className="trust-logos">
             <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Stanford</div><div style={{ fontSize: '1.25rem', fontWeight: 800 }}>MIT</div><div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Harvard</div><div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Cambridge</div><div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Oxford</div>
          </div>
        </div>
      </div>

      <section className="section-padding max-width">
        <div className="section-header"><h2 className="section-title">Everything you need to lead.</h2><p className="section-subtitle">A unified platform that adapts to your unique learning style.</p></div>
        <motion.div className="feature-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} className="feature-card" variants={itemVariants}>
              <div className="feature-icon-box" style={{ background: `${f.color}15`, color: f.color }}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3><p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="steps-section">
        <div className="max-width">
          <div className="section-header"><h2 className="section-title">Success in 3 easy steps</h2><p className="section-subtitle">Ditch the sticky notes. Move your entire student life into Routineo today.</p></div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{s.number}</div>
                <div className="step-content"><div className="step-icon-circle">{i === 0 ? <Globe size={28} /> : i === 1 ? <Smartphone size={28} /> : <Zap size={28} />}</div><h3 className="feature-title">{s.title}</h3><p className="feature-desc">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding max-width">
        <div className="section-header"><h2 className="section-title">Science-backed study tips</h2><p className="section-subtitle">Unlock your full potential with proven learning frameworks.</p></div>
        <div className="filter-buttons">{categories.map(cat => (<div key={cat} className={`filter-tag ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</div>))}</div>
        <motion.div className="tips-grid" layout>
          {filteredTips.map((tip) => (
            <motion.div key={tip.title} className="tip-card" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}><span style={{ color: '#7C3AED', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tip.tag}</span><Heart size={16} color="#E2E8F0" /></div>
              <h3 className="feature-title" style={{ fontSize: '1.125rem' }}>{tip.title}</h3><p className="feature-desc">{tip.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section-padding max-width">
        <div className="section-header"><h2 className="section-title">Trusted by scholars</h2><p className="section-subtitle">Join over 50,000 students who have transformed their grades.</p></div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="avatar-circle">{t.avatar}</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>{[...Array(5)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />)}</div>
              <p style={{ fontStyle: 'italic', color: '#475569', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>"{t.text}"</p>
              <div><p style={{ fontWeight: 800, color: '#0F172A' }}>{t.author}</p><p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>{t.role}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section max-width">
        <div className="cta-box">
          <img src="/celebration.png" className="cta-image-overlay" alt="Students celebrating" />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 className="section-title" style={{ color: 'white' }}>Ready to crush your goals?</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '40px' }}>Join Routineo today and take the first step towards academic mastery. No credit card required.</p>
            <Link to="/login" className="btn btn-solid" style={{ background: 'white', color: '#7C3AED', padding: '16px 40px', fontSize: '1.125rem' }}>Create Your Account Now</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="max-width">
          <div className="footer-grid">
            <div>
              <Link to="/" className="logo footer-logo"><div className="logo-icon" style={{ background: 'white', color: '#7C3AED' }}><Flame size={24} /></div><span className="font-outfit footer-logo-text">Routineo</span></Link>
              <p className="footer-desc">Empowering the next generation of scholars with cutting-edge productivity tools. Built for students, by students.</p>
            </div>
            <div>
              <h4 className="footer-heading">Platform</h4>
              <ul className="footer-list">
                <li><Link to="/login" className="footer-link">Dashboard</Link></li>
                <li><Link to="/login" className="footer-link">Task Manager</Link></li>
                <li><Link to="/login" className="footer-link">Habit Tracker</Link></li>
                <li><Link to="/login" className="footer-link">Focus Timer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">About Us</a></li>
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a href="#" className="footer-link">Terms of Service</a></li>
                <li><a href="#" className="footer-link">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Routineo Inc. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}><a href="#" className="footer-link">Twitter</a><a href="#" className="footer-link">Instagram</a><a href="#" className="footer-link">Discord</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
