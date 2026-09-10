import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import PricingSection from '../components/pricing/PricingSection.jsx';
import { HelpCircle, ChevronDown, Award, Sparkles, Check, X } from 'lucide-react';
import Badge from '../components/common/Badge.jsx';

const faqs = [
  {
    q: 'How does the 5 free mock interviews limit work?',
    a: 'On the Free tier, you can create and complete up to 5 full AI mock interviews. Each session includes real-time voice speech recognition, audio playback, and comprehensive STAR feedback. Once all 5 are used, you can upgrade to the Paid tier for unlimited sessions.',
  },
  {
    q: 'What is included in the Unlimited Paid tier?',
    a: 'The Paid tier removes all mock interview caps, allowing you to practice as many technical, behavioral, and mixed interviews as you want. You also get priority Gemini 2.0 Flash AI speed, longer 10-question sessions, and deep concept gap analytics.',
  },
  {
    q: 'Can I switch or cancel anytime?',
    a: 'Yes, absolutely. You can upgrade to Unlimited whenever you are preparing for upcoming interviews and switch back to Free whenever you wish.',
  },
  {
    q: 'Do I need to enter credit card details for the Free tier?',
    a: 'No card is required. You can get started right away and practice your first 5 interviews for free.',
  },
];

const featureComparison = [
  { feature: 'AI Mock Interviews Quota', free: '5 Free Sessions', paid: 'Unlimited Sessions' },
  { feature: 'Gemini 2.0 Flash Intelligence', free: true, paid: true },
  { feature: 'Voice Speech-to-Text Recognition', free: true, paid: true },
  { feature: 'Text-to-Speech Audio Playback', free: true, paid: true },
  { feature: 'Webcam Practice Feed', free: true, paid: true },
  { feature: 'STAR Answer Feedback & Scoring', free: true, paid: true },
  { feature: 'Priority AI Processing Speed', free: false, paid: true },
  { feature: 'Up to 10 Questions Per Interview', free: false, paid: true },
  { feature: 'Concept Gap & Exemplar Answers', free: false, paid: true },
  { feature: 'Priority Candidate Support', free: false, paid: true },
];

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 relative overflow-hidden flex flex-col">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-indigo w-[650px] h-[650px] -top-52 left-1/3" />
      <div className="ambient-glow-purple w-[550px] h-[550px] top-2/3 -right-48" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
        {/* Main Pricing Section */}
        <PricingSection />

        {/* Feature Comparison Table */}
        <section className="py-16 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="purple" size="md" dot className="mb-2">
              Deep Dive
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Feature Comparison Matrix
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Compare capabilities between Free Starter and Unlimited Pro tiers.
            </p>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
            <div className="grid grid-cols-12 bg-slate-900/90 p-4 sm:p-5 border-b border-white/10 font-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-300">
              <div className="col-span-6">Capability</div>
              <div className="col-span-3 text-center">Free Starter</div>
              <div className="col-span-3 text-center text-indigo-400">Unlimited Pro</div>
            </div>

            <div className="divide-y divide-white/5 text-xs sm:text-sm">
              {featureComparison.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-6 font-medium text-slate-200">
                    {row.feature}
                  </div>
                  <div className="col-span-3 text-center flex justify-center">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <X className="h-4 w-4 text-slate-600" />
                      )
                    ) : (
                      <span className="font-semibold text-slate-300">{row.free}</span>
                    )}
                  </div>
                  <div className="col-span-3 text-center flex justify-center">
                    {typeof row.paid === 'boolean' ? (
                      row.paid ? (
                        <Check className="h-4 w-4 text-indigo-400" />
                      ) : (
                        <X className="h-4 w-4 text-slate-600" />
                      )
                    ) : (
                      <span className="font-extrabold text-indigo-300">{row.paid}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold font-heading text-white flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-indigo-400" />
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Have questions about mock interview limits or plans? We've got answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 relative z-10 glass-panel mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-bold text-white font-heading">PrepAI</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PrepAI. All rights reserved. Powered by Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
