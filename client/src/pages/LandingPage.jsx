import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import {
  ArrowRight,
  Video,
  FileText,
  Mail,
  BookOpen,
  Mic,
  Activity,
  CheckCircle2,
  Cpu,
  Terminal,
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import PricingSection from '../components/pricing/PricingSection.jsx';

const LandingPage = () => {
  const { isSignedIn } = useAuth();

  const services = [
    {
      icon: Video,
      title: 'Mock Technical Interviews',
      description:
        'Voice-driven technical evaluations with speech synthesis, audio capture, webcam tracking, and structured STAR feedback.',
      tag: 'Interactive Voice',
      link: '/dashboard/mocks',
    },
    {
      icon: BookOpen,
      title: 'Adaptive Skill Assessments',
      description:
        'Role-specific multiple-choice assessments testing practical edge cases, architecture decisions, and code evaluation.',
      tag: 'Role Adaptive',
      link: '/dashboard/quizzes',
    },
    {
      icon: FileText,
      title: 'ATS Resume Engineering',
      description:
        'ATS-compliant resume compiler with automated scoring, STAR bullet rewriting, and instant PDF generation.',
      tag: 'ATS Optimized',
      link: '/dashboard/resumes',
    },
    {
      icon: Mail,
      title: 'Cover Letter Studio',
      description:
        'Tailored application briefs generated from target job descriptions with configurable technical depth.',
      tag: 'Role Targeted',
      link: '/dashboard',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Target role and stack',
      description: 'Define your desired seniority, tech stack, and evaluation format.',
    },
    {
      number: '02',
      title: 'Voice-driven simulation',
      description: 'Answer scenario-based engineering questions under real interview conditions.',
    },
    {
      number: '03',
      title: 'Rubric evaluation',
      description: 'Receive immediate grading across technical depth, trade-offs, and communication.',
    },
    {
      number: '04',
      title: 'Iterative mastery',
      description: 'Review transcripts, close concept gaps, and optimize your resume.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#ededed] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2">
                <Badge variant="slate" size="sm" dot>
                  Engineering Assessment Engine
                </Badge>
                <span className="text-xs font-mono text-slate-500">
                  v2.4
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
                Technical interview simulations calibrated for software engineers
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                Practice scenario-based system design and code interviews with voice recognition,
                instant rubric grading, adaptive diagnostic quizzes, and ATS resume audits.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link to={isSignedIn ? '/dashboard' : '/sign-up'}>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full sm:w-auto"
                  >
                    {isSignedIn ? 'Open dashboard' : 'Start assessment'}
                  </Button>
                </Link>
                <Link to="/dashboard/mocks">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={Video}
                    className="w-full sm:w-auto"
                  >
                    Explore mock interviews
                  </Button>
                </Link>
              </div>

              {/* Technical Telemetry Badges */}
              <div className="pt-6 border-t border-white/8 grid grid-cols-3 gap-4 text-xs font-mono text-slate-400">
                <div>
                  <span className="block text-white font-semibold text-sm">4.8/5.0</span>
                  <span className="text-[11px] text-slate-500">Average candidate rating</span>
                </div>
                <div>
                  <span className="block text-white font-semibold text-sm">STAR</span>
                  <span className="text-[11px] text-slate-500">Rubric breakdown</span>
                </div>
                <div>
                  <span className="block text-white font-semibold text-sm">&lt;50ms</span>
                  <span className="text-[11px] text-slate-500">Local audio latency</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Craft Live Product Moment */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-white/10 bg-[#12151e] overflow-hidden shadow-2xl">
                {/* Console Window Header */}
                <div className="px-4 py-3 bg-[#161a24] border-b border-white/8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      session_tech_lead.sim
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-[11px] font-mono text-rose-300 uppercase tracking-wider">
                      REC 00:14:28
                    </span>
                  </div>
                </div>

                {/* Simulation Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Question Stem */}
                  <div className="p-4 rounded-lg bg-[#181c28] border border-white/8 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <Terminal className="h-3.5 w-3.5" />
                        System Architecture Question 03
                      </span>
                      <span>Senior Level</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      "Describe how you diagnose and isolate memory leaks in high-throughput Node.js microservices under production load."
                    </p>
                  </div>

                  {/* Audio Telemetry & Transcription preview */}
                  <div className="p-4 rounded-lg bg-[#0e1017] border border-white/8 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Mic className="h-3.5 w-3.5 text-emerald-400" />
                        Candidate Audio Track
                      </span>
                      <span className="text-emerald-400">Streaming</span>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="h-8 flex items-center gap-1.5 px-2 bg-[#12151e] rounded border border-white/5">
                      <div className="w-1 wave-bar bg-sky-400 rounded-full" />
                      <div className="w-1 wave-bar bg-sky-400 rounded-full" />
                      <div className="w-1 wave-bar bg-sky-400 rounded-full" />
                      <div className="w-1 wave-bar bg-sky-400 rounded-full" />
                      <div className="w-1 wave-bar bg-sky-400 rounded-full" />
                      <div className="w-1 wave-bar bg-sky-400 rounded-full" />
                      <div className="w-1 h-3 bg-slate-700 rounded-full" />
                      <div className="w-1 h-4 bg-slate-700 rounded-full" />
                      <div className="w-1 h-2 bg-slate-700 rounded-full" />
                      <span className="text-[11px] font-mono text-slate-400 ml-auto">
                        48 kHz PCM
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      "I inspect the V8 heap snapshot using Chrome DevTools heap profiler, isolate retainer trees, and verify whether dangling event listeners or closures are holding references..."
                    </p>
                  </div>

                  {/* Real-time Rubrics Telemetry */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
                    <div className="p-2.5 rounded bg-[#181c28] border border-white/8">
                      <span className="text-[10px] text-slate-400 block">Root Cause</span>
                      <span className="text-white font-semibold">9.4/10</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#181c28] border border-white/8">
                      <span className="text-[10px] text-slate-400 block">Tech Depth</span>
                      <span className="text-white font-semibold">9.1/10</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#181c28] border border-white/8">
                      <span className="text-[10px] text-slate-400 block">STAR Format</span>
                      <span className="text-white font-semibold">8.9/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
              Structured preparation modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each module targets a specific phase of the technical interview loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc, i) => (
              <div
                key={i}
                className="glass-panel-interactive rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#181c28] border border-white/10 text-white flex items-center justify-center">
                      <svc.icon className="h-4 w-4 text-sky-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/8">
                      {svc.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {svc.description}
                  </p>
                </div>

                <Link
                  to={isSignedIn ? svc.link : '/sign-up'}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span>Launch module</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sequential Process */}
      <section className="py-16 sm:py-20 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
              Assessment sequence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Four structured milestones from scenario configuration to job offer readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-xl p-5 border border-white/8"
              >
                <span className="text-xs font-mono text-slate-500 block mb-3">
                  Step {step.number}
                </span>
                <h4 className="text-sm font-semibold text-white mb-1.5">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection className="border-b border-white/8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-16" />

      {/* Footer */}
      <footer className="py-8 bg-[#0c0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-white">
              PrepAI Assessment Platform
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500">
            © {new Date().getFullYear()} PrepAI. Designed for engineering assessment.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
