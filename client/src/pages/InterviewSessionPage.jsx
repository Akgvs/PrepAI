import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  HelpCircle,
  Terminal,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import interviewService from '../services/interview.service.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
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

  // Webcam State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const synthRef = useRef(window.speechSynthesis || null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();

  // Load Interview Data
  const fetchInterview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await interviewService.getById(id);
      setInterview(res.data);
      // Preload first question answer if it exists
      if (res.data?.questions?.[0]?.answer) {
        setUserAnswer(res.data.questions[0].answer);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load interview session');
      navigate('/dashboard/mocks');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchInterview();
  }, [fetchInterview]);

  // Sync speech recognition transcript into input
  useEffect(() => {
    if (transcript) {
      setUserAnswer((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Session timer
  useEffect(() => {
    if (interview?.status === 'completed') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [interview?.status]);

  // Handle webcam
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        toast.error('Unable to access webcam. Please check browser permissions.');
      }
    }
  };

  // Clean up media streams and voice on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Text to Speech
  const speakText = useCallback(
    (text) => {
      if (!synthRef.current || isMuted) return;
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [isMuted]
  );

  const toggleMute = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const handleSpeakQuestion = () => {
    const q = interview?.questions?.[activeQuestionIndex]?.question;
    if (q) speakText(q);
  };

  // Navigation between questions
  const handleSelectQuestion = (index) => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setActiveQuestionIndex(index);
    const targetQ = interview?.questions?.[index];
    setUserAnswer(targetQ?.answer || '');
    resetTranscript();
  };

  // Toggle mic recording
  const handleToggleSpeech = () => {
    if (!isSpeechSupported) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Submit Answer & Evaluate via AI
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      return toast.error('Please record or type an answer before evaluation.');
    }
    if (isListening) {
      stopListening();
    }

    setSubmitting(true);
    try {
      const questionId = interview.questions[activeQuestionIndex]._id;
      const res = await interviewService.answerQuestion(id, {
        questionId,
        answer: userAnswer,
      });

      setInterview(res.data);
      toast.success('Answer evaluated by AI rubric');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Complete Interview
  const handleComplete = async () => {
    if (!window.confirm('Are you ready to finalize this interview and generate your performance report?')) {
      return;
    }

    setCompleting(true);
    try {
      const res = await interviewService.complete(id);
      setInterview(res.data);
      toast.success('Interview finalized! Viewing evaluation summary.');
    } catch (err) {
      toast.error(err.message || 'Failed to complete interview');
    } finally {
      setCompleting(false);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-400">Loading interview session telemetry...</p>
      </div>
    );
  }

  if (!interview) return null;

  const questions = interview.questions || [];
  const currentQuestion = questions[activeQuestionIndex] || {};
  const isCompleted = interview.status === 'completed';

  // If completed, show structured review screen
  if (isCompleted) {
    const overallScore =
      interview.overallScore !== null && interview.overallScore !== undefined
        ? interview.overallScore
        : 'N/A';

    return (
      <div className="space-y-6">
        <Link
          to="/dashboard/mocks"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Sessions
        </Link>

        {/* Hero Score Card */}
        <div className="rounded-xl p-6 sm:p-8 bg-[#12151e] border border-white/8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <Badge variant="emerald" size="sm" dot>
                  Evaluation Complete
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-1">
                Candidate Assessment Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                Rubric grading for <strong className="text-slate-200">{interview.jobRole}</strong> ({interview.experienceLevel} level).
              </p>
            </div>

            {/* Score Ring / Gauge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-lg bg-[#161a24] border border-white/8 min-w-[130px] text-center shrink-0">
              <span className="text-3xl font-mono font-semibold text-white tracking-tight tabular-nums">
                {overallScore}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                Score / 10.0
              </span>
            </div>
          </div>
        </div>

        {/* Question-by-Question Detailed Feedback */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-slate-400" />
            Evaluation Telemetry by Question
          </h2>

          {questions.map((q, idx) => (
            <div
              key={q._id || idx}
              className="rounded-xl p-5 bg-[#12151e] border border-white/8 space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/8">
                <span className="text-xs font-mono uppercase text-slate-400">
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

              <h3 className="text-sm font-semibold text-white">
                {q.question}
              </h3>

              {/* Candidate's Answer */}
              <div className="bg-[#0e1017] rounded-lg p-3.5 border border-white/8">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Candidate Response
                </span>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {q.answer || '(No answer provided)'}
                </p>
              </div>

              {/* Detailed AI Feedback */}
              {q.feedback && (
                <div className="bg-[#141824] rounded-lg p-3.5 border border-white/8">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-1">
                    <Terminal className="h-3 w-3" /> Rubric Feedback
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {q.feedback}
                  </p>
                </div>
              )}

              {/* Strengths & Weaknesses Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {q.strengths?.length > 0 && (
                  <div className="bg-[#121c17] rounded-lg p-3 border border-emerald-500/20">
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 mb-2">
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
                  <div className="bg-[#1f1317] rounded-lg p-3 border border-rose-500/20">
                    <span className="text-xs font-medium text-rose-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5" /> Improvement Vectors
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
                <div className="bg-[#161a24] rounded-lg p-3.5 border border-white/8">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Lightbulb className="h-3 w-3 text-amber-400" /> Reference Architecture Answer
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {q.betterAnswer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Link to="/dashboard/mocks">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Start new session
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Active in-progress interview loop
  return (
    <div className="space-y-5">
      {/* Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/8">
        <div>
          <Link
            to="/dashboard/mocks"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors mb-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Sessions
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            {interview.jobRole}
          </h1>
          <span className="text-xs text-slate-500 font-mono uppercase">
            {interview.interviewType} • {interview.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#12151e] border border-white/8 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="tabular-nums">{formatTimer(timerSeconds)}</span>
          </div>

          <Button
            onClick={handleComplete}
            variant="danger"
            size="sm"
            loading={completing}
          >
            Finalize Session
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
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isCurrent
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : isAnswered
                  ? 'bg-[#121c17] text-emerald-300 border border-emerald-500/20 hover:bg-[#16231c]'
                  : 'bg-[#12151e] text-slate-400 border border-white/8 hover:text-white'
              }`}
            >
              {isAnswered && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
              Q{idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Split Layout: Question & Speech on Left, Camera & Assistant on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Question & Candidate Answer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Question Box */}
          <div className="rounded-xl p-5 bg-[#12151e] border border-white/8 relative">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-mono uppercase text-slate-400">
                Question {activeQuestionIndex + 1} of {interview.questions.length}
              </span>

              {/* Audio Playback Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSpeakQuestion}
                  className={`p-1.5 rounded border transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-[#181c28] text-slate-300 border-white/10 hover:text-white'
                  }`}
                  title="Listen to question"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-[#181c28] text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <h2 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {currentQuestion?.question}
            </h2>

            {/* Speaking Status Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 mt-3 text-xs text-sky-400 font-mono">
                <div className="flex items-center gap-1 h-3">
                  <span className="w-1 bg-sky-400 rounded wave-bar" />
                  <span className="w-1 bg-sky-400 rounded wave-bar" />
                  <span className="w-1 bg-sky-400 rounded wave-bar" />
                </div>
                <span>Speech synthesizer active...</span>
              </div>
            )}
          </div>

          {/* Recording & Waveform Indicator */}
          {isListening && (
            <div className="rounded-xl bg-[#1a1215] border border-rose-500/20 p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs font-mono text-rose-300">
                  Microphone Audio Stream Active
                </span>
              </div>
              <div className="flex items-center gap-1 h-4">
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
                <span className="w-1 bg-rose-400 rounded wave-bar" />
              </div>
            </div>
          )}

          {/* Answer Textarea */}
          <div className="rounded-xl p-4 bg-[#12151e] border border-white/8 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
              <span>Candidate Response Buffer</span>
              <span className="tabular-nums">{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            <textarea
              rows={6}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Record your response through your microphone, or type your answer here..."
              className="w-full bg-[#0c0e14] border border-white/10 focus:border-white/30 rounded-lg p-3 text-xs sm:text-sm text-white placeholder-slate-600 outline-none resize-none leading-relaxed transition-colors font-mono"
            />

            {/* Answer Control Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleSpeech}
                  variant={isListening ? 'danger' : 'secondary'}
                  size="sm"
                  icon={isListening ? MicOff : Mic}
                >
                  {isListening ? 'Stop recording' : 'Record voice'}
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
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  icon={Activity}
                >
                  Evaluate response
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
          <div className="rounded-xl p-4 bg-[#12151e] border border-white/8 space-y-3">
            <div className="relative aspect-video bg-[#0c0e14] rounded-lg overflow-hidden border border-white/8 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="text-center p-6 text-slate-500 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-[#161a24] border border-white/8 flex items-center justify-center mx-auto text-slate-400">
                    <CameraOff className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Camera preview disabled. Enable for posture and eye contact practice.
                  </p>
                </div>
              )}

              {/* Status Pill on Video */}
              <div className="absolute top-2.5 right-2.5">
                <Badge
                  variant={isCameraActive ? 'emerald' : 'slate'}
                  size="sm"
                  dot={isCameraActive}
                >
                  {isCameraActive ? 'Live' : 'Off'}
                </Badge>
              </div>
            </div>

            <Button
              onClick={toggleCamera}
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              icon={isCameraActive ? CameraOff : Camera}
            >
              {isCameraActive ? 'Disable webcam' : 'Enable webcam'}
            </Button>
          </div>

          {/* Interview Coaching Card */}
          <div className="rounded-xl p-4 bg-[#12151e] border border-white/8 space-y-2.5">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              Evaluation Rubric Guidance
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">•</span>
                <span><strong>STAR Structure:</strong> Contextualize Situation, Task, Action taken, and quantifiable Result.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">•</span>
                <span><strong>Architectural Trade-offs:</strong> Discuss latency vs. memory, consistency vs. availability.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">•</span>
                <span><strong>Precision:</strong> Concrete technical details rank higher than generic generalizations.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionPage;
