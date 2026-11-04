import { useState } from 'react';
import { Sparkles } from 'lucide-react';
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
      title="Configure Smart MCQ Assessment"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Assessment Topic
          </label>
          <select
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {QUIZ_TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
            <option value="custom">Custom Specialized Domain...</option>
          </select>
        </div>

        {form.topic === 'custom' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Custom Topic Name
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js App Router & SSR, Kafka Streaming..."
              value={form.customTopic}
              onChange={(e) => setForm({ ...form, customTopic: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Tech Stack Focus <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. React 18, Node 20, PostgreSQL, Redis"
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Key Concepts / Focus Areas <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Concurrency, Custom Hooks, Indexing, Memory Leaks"
            value={form.focusAreas}
            onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Difficulty
            </label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
              <option value="mixed">Mixed Adaptive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Number of Questions
            </label>
            <select
              value={form.numberOfQuestions}
              onChange={(e) =>
                setForm({ ...form, numberOfQuestions: Number(e.target.value) })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {QUIZ_QUESTION_COUNTS.map((count) => (
                <option key={count} value={count}>
                  {count} Questions
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Timer Limit (Minutes)
          </label>
          <select
            value={form.timeLimitMinutes}
            onChange={(e) =>
              setForm({ ...form, timeLimitMinutes: Number(e.target.value) })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value={5}>5 Minutes (Speed Run)</option>
            <option value={10}>10 Minutes (Standard)</option>
            <option value={15}>15 Minutes (Comprehensive)</option>
            <option value={20}>20 Minutes (Deep Dive)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Custom Title <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Frontend Diagnostic"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
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
            icon={Sparkles}
          >
            {submitting ? 'Generating AI Questions...' : 'Start Assessment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateQuizModal;
