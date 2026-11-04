import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import {
  QUIZ_TOPICS,
  QUIZ_QUESTION_COUNTS,
  DIFFICULTY_LEVELS,
} from '../../utils/constants.js';

const CreateQuizModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    title: '',
    topic: 'Full-Stack Development',
    customTopic: '',
    techStack: 'React, Node.js, TypeScript',
    focusAreas: '',
    difficulty: 'medium',
    numberOfQuestions: 5,
    timeLimitMinutes: 10,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTopic =
      form.topic === 'custom'
        ? form.customTopic.trim() || 'General Engineering'
        : form.topic;

    onSubmit({
      title: form.title.trim() || undefined,
      topic: finalTopic,
      techStack: form.techStack.trim(),
      focusAreas: form.focusAreas.trim() || undefined,
      difficulty: form.difficulty,
      numberOfQuestions: Number(form.numberOfQuestions),
      timeLimitMinutes: Number(form.timeLimitMinutes),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Assessment Parameters"
      description="Select technical domain and telemetry constraints for adaptive question generation."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Assessment Domain *
          </label>
          <select
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
          >
            {QUIZ_TOPICS.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#12151e] text-white">
                {t.label}
              </option>
            ))}
            <option value="custom" className="bg-[#12151e] text-white">Custom Domain...</option>
          </select>
        </div>

        {form.topic === 'custom' && (
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Custom Domain Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Consensus & Raft, PostgreSQL Internals..."
              value={form.customTopic}
              onChange={(e) => setForm({ ...form, customTopic: e.target.value })}
              required
              className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Tech Stack Focus <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. React 19, Node.js 22, PostgreSQL, Redis"
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Key Concepts / Edge Cases <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Concurrency, Custom Hooks, Indexing, Memory Leaks"
            value={form.focusAreas}
            onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
            className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Difficulty
            </label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d.value} value={d.value} className="bg-[#12151e] text-white">
                  {d.label}
                </option>
              ))}
              <option value="mixed" className="bg-[#12151e] text-white">Mixed Adaptive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Number of Questions
            </label>
            <select
              value={form.numberOfQuestions}
              onChange={(e) =>
                setForm({ ...form, numberOfQuestions: Number(e.target.value) })
              }
              className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
            >
              {QUIZ_QUESTION_COUNTS.map((count) => (
                <option key={count} value={count} className="bg-[#12151e] text-white">
                  {count} Questions
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Timer Limit
          </label>
          <select
            value={form.timeLimitMinutes}
            onChange={(e) =>
              setForm({ ...form, timeLimitMinutes: Number(e.target.value) })
            }
            className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
          >
            <option value={5} className="bg-[#12151e] text-white">5 Minutes (Sprint)</option>
            <option value={10} className="bg-[#12151e] text-white">10 Minutes (Standard)</option>
            <option value={15} className="bg-[#12151e] text-white">15 Minutes (Comprehensive)</option>
            <option value={20} className="bg-[#12151e] text-white">20 Minutes (Deep Diagnostic)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Session Title <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Frontend Diagnostic Sprint"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#12151e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/8">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={ArrowRight}
            iconPosition="right"
          >
            {submitting ? 'Synthesizing Questions...' : 'Start Assessment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateQuizModal;
