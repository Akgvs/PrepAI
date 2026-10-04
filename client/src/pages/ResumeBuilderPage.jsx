import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import MDEditor from '@uiw/react-md-editor';

import resumeService from '../services/resume.service.js';
import Button from '../components/common/Button.jsx';
import ResumeForm from '../components/resume/ResumeForm.jsx';
import ATSScoreCard from '../components/resume/ATSScoreCard.jsx';
import { generateResumeMarkdown } from '../utils/resumeMarkdown.js';

const ResumeBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [markdownContent, setMarkdownContent] = useState('');
  const [resumeMode, setResumeMode] = useState('preview'); // 'edit' | 'preview' for the md editor

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await resumeService.getById(id);
        setResume(res.data);
        setMarkdownContent(generateResumeMarkdown(res.data));
      } catch (err) {
        toast.error('Failed to load resume');
        navigate('/dashboard/resumes');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, navigate]);

  const handleResumeChange = (newData) => {
    setResume(newData);
    setMarkdownContent(generateResumeMarkdown(newData));
  };

  const handleSave = async (showToast = true) => {
    try {
      setSaving(true);
      const res = await resumeService.update(id, resume);
      setResume(res.data);
      if (showToast) toast.success('Resume saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleScoreATS = async () => {
    try {
      setScoring(true);
      await handleSave(false); // Auto-save before scoring
      const res = await resumeService.scoreATS(id);
      setResume((prev) => ({
        ...prev,
        atsScore: res.data.atsScore,
        status: 'scored',
      }));
      toast.success('ATS analysis complete!');
      setActiveTab('editor'); // Ensure we are on editor tab to see the score
    } catch (err) {
      toast.error(err.message || 'Failed to score resume');
    } finally {
      setScoring(false);
    }
  };

  const handleRewriteBullet = async () => {
    // Deprecated for the simplified version
  };

  const downloadPDF = () => {
    toast.success('Generating PDF...');
    
    const element = document.getElementById('resume-pdf');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `${resume.title.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading || !resume) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-6 sm:-m-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-slate-900/80 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/resumes')}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-heading text-white line-clamp-1">
              {resume.title}
            </h1>
            <p className="text-xs text-slate-400">
              {resume.status === 'scored' ? 'Scored' : 'Draft'} • Updated{' '}
              {new Date(resume.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Tabs */}
          <div className="flex sm:hidden bg-slate-800 p-1 rounded-lg mr-auto">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'editor' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'preview' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              Preview
            </button>
          </div>

          <Button
            onClick={handleSave}
            loading={saving}
            variant="secondary"
            size="sm"
            icon={Save}
          >
            Save
          </Button>
          <Button
            onClick={downloadPDF}
            variant="primary"
            size="sm"
            icon={Download}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
        {/* Left Side: Editor & ATS Score */}
        <div
          className={`flex-1 sm:w-1/2 lg:w-5/12 xl:w-1/3 flex flex-col h-full bg-[#0b0f19] border-r border-white/5 overflow-y-auto ${
            activeTab === 'preview' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="p-4 sm:p-6 space-y-6">
            <ATSScoreCard
              atsScore={resume.atsScore}
              onScore={handleScoreATS}
              loading={scoring}
            />

            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white font-heading">
                Resume Content
              </h2>
            </div>
            
            <ResumeForm
              data={resume}
              onChange={handleResumeChange}
              onRewriteBullet={handleRewriteBullet}
              rewriting={null}
            />
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div
          data-color-mode="light"
          className={`flex-1 sm:w-1/2 lg:w-7/12 xl:w-2/3 h-full bg-slate-950 overflow-y-auto p-4 flex flex-col ${
            activeTab === 'editor' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="font-bold text-lg">Markdown Preview</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setResumeMode(resumeMode === 'preview' ? 'edit' : 'preview')}
            >
              {resumeMode === 'preview' ? 'Edit Markdown' : 'Show Preview'}
            </Button>
          </div>

          <div className="flex-1 bg-white rounded-lg overflow-hidden border-2 border-slate-700">
            <MDEditor
              value={markdownContent}
              onChange={setMarkdownContent}
              height="100%"
              preview={resumeMode}
            />
          </div>

          {/* Hidden PDF Container */}
          <div className="hidden">
            <div id="resume-pdf" className="p-8 bg-white text-black" style={{ minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}>
              <MDEditor.Markdown
                source={markdownContent}
                style={{ background: 'white', color: 'black' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
