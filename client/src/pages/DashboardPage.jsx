import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video,
  FileText,
  BookOpen,
  Calendar,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import interviewService from '../services/interview.service.js';
import resumeService from '../services/resume.service.js';
import quizService from '../services/quiz.service.js';
import useUsageQuota from '../hooks/useUsageQuota.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usageData, isPaid } = useUsageQuota();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [intRes, resRes, quizRes] = await Promise.all([
        interviewService.getAll(),
        resumeService.getAll(),
        quizService.getAll(),
      ]);
      setInterviews(intRes.data || []);
      setResumes(resRes.data || []);
      setQuizzes(quizRes.data || []);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completedSessions = interviews.filter((i) => i.status === 'completed');
  const scores = completedSessions
    .map((i) => i.overallScore)
    .filter((s) => s !== null && s !== undefined);
  const averageScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : '—';

  const monthlyInterviewsUsed = usageData?.usage?.interviewsGenerated || 0;
  const isUnlimited = isPaid || usageData?.isUnlimited || usageData?.limits?.interviewsGenerated === null;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-xl p-6 sm:p-8 border border-white/8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Telemetry & Readiness
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Engineering Assessment Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Practice scenario-based interviews with speech recognition, evaluate system design concepts, and verify ATS resume compliance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            <Button
              onClick={() => navigate('/dashboard/quizzes')}
              variant="secondary"
              size="md"
              icon={BookOpen}
              className="w-full sm:w-auto"
            >
              Practice quizzes
            </Button>
            <Button
              onClick={() => navigate('/dashboard/mocks')}
              variant="primary"
              size="md"
              icon={Video}
              className="w-full sm:w-auto"
            >
              Start mock interview
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row - Quiet Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/8">
          <span className="text-xs font-mono text-slate-400 block mb-1">
            Total Sessions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
              {interviews.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono block mt-1">
            Across all engineering tracks
          </span>
        </div>

        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/8">
          <span className="text-xs font-mono text-slate-400 block mb-1">
            Completed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
              {completedSessions.length}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({interviews.length ? Math.round((completedSessions.length / interviews.length) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono block mt-1">
            Full rubric evaluated
          </span>
        </div>

        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/8">
          <span className="text-xs font-mono text-slate-400 block mb-1">
            Average Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
              {averageScore !== '—' ? averageScore : '—'}
            </span>
            {averageScore !== '—' && (
              <span className="text-xs font-mono text-slate-500">/ 10</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono block mt-1">
            STAR framework rating
          </span>
        </div>

        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/8">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-slate-400">
              Monthly Quota
            </span>
            {!isUnlimited && (
              <Link
                to="/pricing"
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300"
              >
                Upgrade
              </Link>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
              {isUnlimited ? 'Unlimited' : `${monthlyInterviewsUsed}/5`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono block mt-1">
            {isUnlimited ? 'Pro Tier Active' : `${5 - monthlyInterviewsUsed} sessions remaining`}
          </span>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="glass-panel rounded-xl p-5 sm:p-6 border border-white/8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              Recent mock interviews
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review transcripts, speech pacing, and concept gap reports.
            </p>
          </div>

          <Link to="/dashboard/mocks">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View all
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            Loading recent interviews...
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/8 rounded-lg">
            <Terminal className="h-6 w-6 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">No sessions recorded yet</p>
            <p className="text-[11px] text-slate-500 mb-3">
              Configure target role and test scenario-based technical questions.
            </p>
            <Button
              onClick={() => navigate('/dashboard/mocks')}
              variant="primary"
              size="sm"
              icon={Video}
            >
              Start first interview
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {interviews.slice(0, 4).map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/dashboard/mocks/${item._id}`)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {item.interviewType || 'Technical'}
                    </span>
                    <Badge
                      variant={item.status === 'completed' ? 'emerald' : 'amber'}
                      size="sm"
                    >
                      {item.status === 'completed' ? 'Completed' : 'In progress'}
                    </Badge>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    {item.jobRole}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1">
                    <span>{item.experienceLevel}</span>
                    <span>•</span>
                    <span>{item.questions?.length || 5} Questions</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.overallScore !== null && item.overallScore !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 block">Rating</span>
                      <span className="text-sm font-semibold text-white font-mono">
                        {item.overallScore}/10
                      </span>
                    </div>
                  )}
                  <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                    {item.status === 'completed' ? 'Feedback' : 'Resume'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Recent Resumes & Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Resumes */}
        <div className="glass-panel rounded-xl p-5 sm:p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Saved resumes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ATS-scored resumes and tailored bullet points.
              </p>
            </div>

            <Link to="/dashboard/resumes">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View all
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/8 rounded-lg">
              <FileText className="h-5 w-5 text-slate-500 mx-auto mb-1.5" />
              <p className="text-xs text-slate-300 font-medium">No resumes built</p>
              <Button
                onClick={() => navigate('/dashboard/resumes')}
                variant="secondary"
                size="sm"
                className="mt-3"
              >
                Create resume
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {resumes.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/dashboard/resumes/${item._id}`)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded transition-colors cursor-pointer"
                >
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {item.targetRole || 'Engineering Candidate'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.atsScore?.overall !== null && item.atsScore?.overall !== undefined && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 block">ATS Match</span>
                        <span className="text-xs font-mono font-semibold text-white">
                          {item.atsScore.overall}%
                        </span>
                      </div>
                    )}
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="glass-panel rounded-xl p-5 sm:p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Skill assessments
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed multiple choice technical diagnostic quizzes.
              </p>
            </div>

            <Link to="/dashboard/quizzes">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View all
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/8 rounded-lg">
              <BookOpen className="h-5 w-5 text-slate-500 mx-auto mb-1.5" />
              <p className="text-xs text-slate-300 font-medium">No assessments completed</p>
              <Button
                onClick={() => navigate('/dashboard/quizzes')}
                variant="secondary"
                size="sm"
                className="mt-3"
              >
                Start quiz
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {quizzes.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/dashboard/quizzes/${item._id}`)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {item.topic}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.percentage !== null && item.percentage !== undefined && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 block">Score</span>
                        <span className="text-xs font-mono font-semibold text-white">
                          {item.percentage}%
                        </span>
                      </div>
                    )}
                    <Button variant="secondary" size="sm">
                      {item.status === 'completed' ? 'Review' : 'Resume'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
