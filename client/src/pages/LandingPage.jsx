import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import {
  ArrowRight,
  Video,
  FileText,
  Mail,
  BookOpen,
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  Award,
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import PricingSection from '../components/pricing/PricingSection.jsx';

const LandingPage = () => {
  const { isSignedIn } = useAuth();

  const services = [
    {
      icon: Video,
      title: 'AI Mock Interviews',
      description:
        'Practice with an AI interviewer equipped with speech recognition, audio voice playback, webcam tracking, and comprehensive STAR feedback.',
      badge: 'Interactive Voice',
      badgeVariant: 'indigo',
    },
    {
      icon: BookOpen,
      title: 'Smart MCQ Quizzes',
      description:
        'Test your technical depth with AI-generated role and stack-specific practice tests with instant explanations and score insights.',
      badge: 'Role Adaptive',
      badgeVariant: 'purple',
    },
    {
      icon: FileText,
      title: 'ATS Resume Builder',
      description:
        'Build ATS-compliant resumes with real-time scoring, STAR-method bullet rewriting, and instant PDF download.',
      badge: 'ATS Optimized',
      badgeVariant: 'emerald',
    },
    {
      icon: Mail,
      title: 'Cover Letter Studio',
      description:
        'Generate tailored cover letters matched against job descriptions across multiple persuasive tones in seconds.',
      badge: 'Custom Tones',
      badgeVariant: 'amber',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Configure Your Target Role',
      description: 'Choose your job role, tech stack, and target seniority level.',
    },
    {
      number: '02',
      title: 'Interactive AI Simulation',
      description: 'Engage with AI via voice speech, webcam, and timed scenario questions.',
    },
    {
      number: '03',
      title: 'Real-Time Evaluation',
      description: 'Receive immediate grading, concept gap analyses, and suggested answers.',
    },
    {
      number: '04',
      title: 'Land Your Dream Offer',
      description: 'Iterate, build confidence, optimize your resume, and ace real interviews.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 relative overflow-hidden flex flex-col">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-indigo w-[700px] h-[700px] -top-64 left-1/4" />
      <div className="ambient-glow-purple w-[600px] h-[600px] top-1/2 -right-48" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-28 sm:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="indigo" size="md" dot>
              <Sparkles className="h-3 w-3 inline text-indigo-400" />
              Powered by Google Gemini 2.0 Flash
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight max-w-5xl mx-auto leading-tight mb-6 text-white">
            Master Technical Interviews with{' '}
            <span className="gradient-title">Intelligent AI</span> Practice
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-sans">
            Prepare with realistic voice-enabled mock interviews, instant answer
            evaluation, role-tailored quizzes, and ATS resume optimization.
            Built for developers, engineers, and tech professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to={isSignedIn ? '/dashboard' : '/sign-up'}>
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                {isSignedIn ? 'Open Dashboard' : 'Start Practicing Free'}
              </Button>
            </Link>
            <Link to="/dashboard/mocks">
              <Button
                variant="secondary"
                size="lg"
                icon={Video}
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Explore Mock Interviews
              </Button>
            </Link>
          </div>

          {/* Social Proof Tags */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-indigo-400" /> Real-time Speech-to-Text
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-purple-400" /> Instant Gemini AI Feedback
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> ATS Compatibility Ready
            </span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-3">
              Comprehensive Career Acceleration
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything you need to practice, refine, and present your best self to recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, i) => (
              <div
                key={i}
                className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <svc.icon className="h-6 w-6" />
                    </div>
                    <Badge variant={svc.badgeVariant} size="sm">
                      {svc.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {svc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-3">
              How It Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Four steps from configuration to job-ready confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-white/5 relative"
              >
                <span className="text-4xl font-extrabold font-heading text-indigo-500/30 block mb-4">
                  {step.number}
                </span>
                <h4 className="text-lg font-bold text-white font-heading mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection className="border-t border-white/5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" />

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-10 relative z-10 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-bold text-white font-heading">
              PrepAI Suite
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PrepAI. All rights reserved. Powered by Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
