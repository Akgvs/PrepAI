import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  Check,
  RotateCcw,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import interviewService from '../services/interview.service.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import useWebcam from '../hooks/useWebcam.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Custom Hooks (SRP)
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSttSupported,
  } = useSpeechRecognition();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isMuted,
    toggleMute,
  } = useSpeechSynthesis();

  const {
    videoRef,
    isActive: isCameraActive,
    toggleCamera,
  } = useWebcam();

  // Sync Speech-to-text transcript into userAnswer textarea
  useEffect(() => {
    if (transcript) {
      setUserAnswer(transcript);
    }
  }, [transcript]);

  // Per-Question Timer
  useEffect(() => {
    if (interview?.status === 'completed') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuestionIndex, interview?.status]);

  const fetchInterview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await interviewService.getById(id);
      setInterview(res.data);
      if (res.data.status !== 'completed' && res.data.questions?.[0]) {
        // Speak initial question if not muted
        speak(res.data.questions[0].question);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load interview');
      navigate('/dashboard/mocks');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, speak]);

  useEffect(() => {
    fetchInterview();
  }, [fetchInterview]);

  const handleSelectQuestion = (index) => {
    stopSpeaking();
    if (isListening) stopListening();
    setActiveQuestionIndex(index);
    setTimerSeconds(0);
    resetTranscript();
    const targetQ = interview.questions[index];
    setUserAnswer(targetQ.answer || '');
    if (!targetQ.answer) {
      speak(targetQ.question);
    }
  };

  const handleToggleSpeech = () => {
    if (!isSttSupported) {
      return toast.error('Speech recognition not supported in this browser. Please type your answer.');
    }
    if (isListening) {
      stopListening();
      toast.success('Microphone paused');
    } else {
      startListening();
      toast.success('Listening... Speak your answer now');
    }
  };

  const handleSpeakQuestion = () => {
    const q = interview.questions[activeQuestionIndex];
    if (q) {
      speak(q.question);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      return toast.error('Please provide an answer by speaking or typing');
    }

    if (isListening) stopListening();
    stopSpeaking();

    const currentQ = interview.questions[activeQuestionIndex];
    setSubmitting(true);

    try {
      const res = await interviewService.submitAnswer(id, {
        questionId: currentQ._id,
        answer: userAnswer.trim(),
      });

      setInterview((prev) => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[activeQuestionIndex] = {
          ...updatedQuestions[activeQuestionIndex],
          ...res.data,
        };
        return { ...prev, questions: updatedQuestions };
      });

      toast.success(`Answer evaluated! Score: ${res.data.score}/10`);

      // Auto-advance to next unanswered question if exists
      if (activeQuestionIndex < interview.questions.length - 1) {
        handleSelectQuestion(activeQuestionIndex + 1);
      }
    } catch (err) {
      toast.error(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (isListening) stopListening();
    stopSpeaking();

    setCompleting(true);
    try {
      const res = await interviewService.complete(id);
      setInterview(res.data);
      toast.success('Interview completed! Review your performance report below.');
    } catch (err) {
      toast.error(err.message || 'Failed to complete interview');
    } finally {
      setCompleting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading interview session...</p>
      </div>
    );
  }

  if (!interview) return null;

  // --------------------------------------------------------------------------
  // COMPLETED STATE: Comprehensive Performance Scorecard
  // --------------------------------------------------------------------------
  if (interview.status === 'completed') {
    const questions = interview.questions || [];
    const overallScore = interview.overallScore ?? 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <Link
          to="/dashboard/mocks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Interviews
        </Link>

        {/* Hero Score Card */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <Badge variant="emerald" size="md" dot className="mb-3">
                Interview Completed
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-black font-heading text-white mb-2">
                Performance Evaluation
              </h1>
              <p className="text-sm text-slate-300 max-w-md">
                Detailed breakdown for <strong className="text-white">{interview.jobRole}</strong> ({interview.experienceLevel}).
              </p>
            </div>

            {/* Score Ring / Gauge */}
            <div className="w-36 h-36 rounded-full bg-slate-900/90 border-4 border-indigo-500/40 flex flex-col items-center justify-center text-center shadow-2xl shadow-indigo-500/20 shrink-0">
              <span className="text-4xl font-black font-heading gradient-title">
                {overallScore}
              </span>
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
                Out of 10
              </span>
            </div>
          </div>
        </div>

        {/* Question-by-Question Detailed Feedback */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            Questions & Evaluator Insights
          </h2>

          {questions.map((q, idx) => (
            <div
              key={q._id || idx}
              className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                <span className="text-xs font-mono uppercase text-indigo-400">
                  Question {idx + 1}
                </span>
                <Badge
                  variant={q.score >= 8 ? 'emerald' : q.score >= 5 ? 'amber' : 'rose'}
                  size="sm"
                  dot
                >
                  Score: {q.score !== null ? `${q.score}/10` : 'Not Evaluated'}
                </Badge>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-white">
                {q.question}
              </h3>

              {/* Candidate's Answer */}
              <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Your Answer
                </span>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {q.answer || '(No answer provided)'}
                </p>
              </div>

              {/* Detailed AI Feedback */}
              {q.feedback && (
                <div className="bg-indigo-950/30 rounded-xl p-4 border border-indigo-500/20">
                  <span className="text-xs font-semibold uppercase text-indigo-400 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Evaluator Feedback
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {q.feedback}
                  </p>
                </div>
              )}

              {/* Strengths & Weaknesses Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {q.strengths?.length > 0 && (
                  <div className="bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-500/20">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                      <Check className="h-3.5 w-3.5" /> Strengths
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {q.strengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.weaknesses?.length > 0 && (
                  <div className="bg-rose-500/10 rounded-xl p-3.5 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5" /> Areas for Improvement
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {q.weaknesses.map((w, wIdx) => (
                        <li key={wIdx} className="flex items-start gap-1.5">
                          <span className="text-rose-400">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Suggested Model Answer */}
              {q.betterAnswer && (
                <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/20">
                  <span className="text-xs font-semibold uppercase text-purple-400 flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="h-3.5 w-3.5" /> Recommended Model Answer
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                    {q.betterAnswer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Link to="/dashboard/mocks">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Start Another Practice Session
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // IN-PROGRESS STATE: Interactive Voice & Video Studio
  // --------------------------------------------------------------------------
  const currentQuestion = interview.questions[activeQuestionIndex];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/mocks"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-heading text-white">
              {interview.jobRole}
            </h1>
            <span className="text-xs text-indigo-400 font-mono uppercase">
              {interview.interviewType} • {interview.difficulty}
            </span>
          </div>
        </div>

        {/* Timer and Finish Button */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <Button
            onClick={handleComplete}
            variant="danger"
            size="sm"
            loading={completing}
          >
            Finish Interview
          </Button>
        </div>
      </div>

      {/* Question Progression Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {interview.questions.map((q, idx) => {
          const isCurrent = idx === activeQuestionIndex;
          const isAnswered = Boolean(q.answer);

          return (
            <button
              key={q._id || idx}
              onClick={() => handleSelectQuestion(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isCurrent
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30'
                  : isAnswered
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isAnswered && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
              Q{idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Split Layout: Question & Speech on Left, Camera & Assistant on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question & Candidate Answer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Question Box */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 relative">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-mono uppercase text-indigo-400">
                Question {activeQuestionIndex + 1} of {interview.questions.length}
              </span>

              {/* Audio Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeakQuestion}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Listen to question"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-heading text-white leading-relaxed">
              {currentQuestion?.question}
            </h2>

            {/* Speaking Status Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 mt-4 text-xs text-indigo-400 font-medium">
                <div className="flex items-center gap-1 h-3">
                  <span className="w-1 bg-indigo-400 rounded wave-bar" />
                  <span className="w-1 bg-indigo-400 rounded wave-bar" />
                  <span className="w-1 bg-indigo-400 rounded wave-bar" />
                </div>
                <span>AI Interviewer is speaking...</span>
              </div>
            )}
          </div>

          {/* Recording & Waveform Indicator */}
          {isListening && (
            <div className="glass-panel bg-rose-500/10 border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="text-xs font-semibold text-rose-300">
                  Recording Answer via Microphone...
                </span>
              </div>
              <div className="flex items-center gap-1 h-6">
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
              </div>
            </div>
          )}

          {/* Answer Textarea */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 relative space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span>Your Spoken or Typed Answer</span>
              <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            <textarea
              rows={6}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Click 'Record Answer' to speak through your microphone, or type your response here directly..."
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 outline-none resize-none leading-relaxed transition-colors font-sans"
            />

            {/* Answer Control Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleSpeech}
                  variant={isListening ? 'danger' : 'primary'}
                  size="sm"
                  icon={isListening ? MicOff : Mic}
                >
                  {isListening ? 'Stop Recording' : 'Record Answer'}
                </Button>

                <Button
                  onClick={() => {
                    setUserAnswer('');
                    resetTranscript();
                  }}
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  title="Clear Answer"
                >
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  onClick={handleSubmitAnswer}
                  variant="success"
                  size="sm"
                  loading={submitting}
                  icon={Sparkles}
                >
                  Evaluate Answer
                </Button>

                {activeQuestionIndex < interview.questions.length - 1 && (
                  <Button
                    onClick={() => handleSelectQuestion(activeQuestionIndex + 1)}
                    variant="secondary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Webcam Video Feed & Quick Tips */}
        <div className="lg:col-span-5 space-y-4">
          {/* Webcam Box */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="text-center p-6 text-slate-500 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <CameraOff className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Camera preview is off. Enable for realistic eye contact practice.
                  </p>
                </div>
              )}

              {/* Status Pill on Video */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant={isCameraActive ? 'emerald' : 'slate'}
                  size="sm"
                  dot={isCameraActive}
                >
                  {isCameraActive ? 'Webcam Live' : 'Camera Off'}
                </Badge>
              </div>
            </div>

            <Button
              onClick={toggleCamera}
              variant="secondary"
              size="sm"
              className="w-full"
              icon={isCameraActive ? CameraOff : Camera}
            >
              {isCameraActive ? 'Turn Off Camera' : 'Enable Webcam'}
            </Button>
          </div>

          {/* Interview Coaching Card */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              Pro Interview Tips
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>Use the STAR framework:</strong> Situation, Task, Action, and quantifiable Result.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Mention core concepts:</strong> Address trade-offs, architecture, and edge cases.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Audio clarity:</strong> Speak at a steady pace; Gemini AI evaluates depth and precision.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionPage;
