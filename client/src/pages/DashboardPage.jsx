import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Layers,
  FileText,
} from 'lucide-react';
import interviewService from '../services/interview.service.js';
import resumeService from '../services/resume.service.js';
import useUsageQuota from '../hooks/useUsageQuota.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usageData, plan, isPaid } = useUsageQuota();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [intRes, resRes] = await Promise.all([
        interviewService.getAll(),
        resumeService.getAll()
      ]);
      setInterviews(intRes.data || []);
      setResumes(resRes.data || []);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <Badge variant="indigo" size="md" dot className="mb-3">
              AI Interview Platform
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-white mb-2">
              Career Readiness Command Center
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Practice real interview scenarios with Gemini AI speech recognition,
              audio question playback, and webcam tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              onClick={() => navigate('/dashboard/mocks')}
              variant="primary"
              size="lg"
              icon={Video}
              className="w-full sm:w-auto"
            >
              Start Mock Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Sessions</span>
            <span className="text-2xl font-bold font-heading text-white">
              {interviews.length}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Completed</span>
            <span className="text-2xl font-bold font-heading text-white">
              {completedSessions.length}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Average Score</span>
            <span className="text-2xl font-bold font-heading text-white">
              {averageScore !== '—' ? `${averageScore}/10` : '—'}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Resumes Built</span>
            <span className="text-2xl font-bold font-heading text-white">
              {resumes.length}
            </span>
          </div>
        </div>

        {isUnlimited ? (
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 flex items-center gap-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-300 font-medium block">
                  Interview Quota
                </span>
                <Badge variant="indigo" size="sm">
                  Pro Plan
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-white">
                  Unlimited
                </span>
                <span className="text-xs text-indigo-300">
                  ({monthlyInterviewsUsed} used)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">
                  Free Tier Quota
                </span>
                <Link
                  to="/pricing"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Upgrade
                </Link>
              </div>
              <ProgressBar
                value={monthlyInterviewsUsed}
                max={5}
                sublabel={`${monthlyInterviewsUsed}/5 Used`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent Sessions Widget */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-white">
              Recent Mock Interviews
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review your past practice sessions and feedback reports.
            </p>
          </div>

          <Link to="/dashboard/mocks">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading recent interviews...
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700/80 rounded-2xl">
            <Video className="h-10 w-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No sessions yet</p>
            <p className="text-xs text-slate-500 mb-4">
              Practice answering questions tailored to your desired job title.
            </p>
            <Button
              onClick={() => navigate('/dashboard/mocks')}
              variant="primary"
              size="sm"
              icon={Video}
            >
              Generate First Interview
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.slice(0, 4).map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/dashboard/mocks/${item._id}`)}
                className="glass-panel-interactive rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase text-indigo-400">
                      {item.interviewType || 'Technical'}
                    </span>
                    <Badge variant={item.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                      {item.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white font-heading">
                    {item.jobRole}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
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

                <div className="flex items-center gap-3">
                  {item.overallScore !== null && item.overallScore !== undefined && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Rating</span>
                      <span className="text-lg font-bold text-emerald-400">
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

      {/* Recent Resumes Widget */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-white">
              Recent Resumes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access your saved ATS-optimized resumes.
            </p>
          </div>

          <Link to="/dashboard/resumes">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading recent resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700/80 rounded-2xl">
            <FileText className="h-10 w-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No resumes built yet</p>
            <p className="text-xs text-slate-500 mb-4">
              Stand out with an AI-powered, ATS-friendly resume.
            </p>
            <Button
              onClick={() => navigate('/dashboard/resumes')}
              variant="primary"
              size="sm"
              icon={FileText}
            >
              Build Resume
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.slice(0, 4).map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/dashboard/resumes/${item._id}`)}
                className="glass-panel-interactive rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase text-teal-400">
                      {item.status === 'scored' ? 'Scored' : 'Draft'}
                    </span>
                    {item.atsScore?.overall >= 80 ? (
                      <Badge variant="emerald" size="sm">Highly Optimized</Badge>
                    ) : item.atsScore?.overall >= 60 ? (
                      <Badge variant="amber" size="sm">Needs Work</Badge>
                    ) : null}
                  </div>
                  <h3 className="text-base font-bold text-white font-heading">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{item.targetRole || 'No Target Role'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.atsScore?.overall !== null && item.atsScore?.overall !== undefined && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">ATS Score</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {item.atsScore.overall}%
                      </span>
                    </div>
                  )}
                  <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
