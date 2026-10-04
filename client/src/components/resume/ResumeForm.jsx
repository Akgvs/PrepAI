import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button.jsx';

const ResumeForm = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState('personalInfo');

  const updateField = (section, field, value) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value,
      },
    });
  };

  const updateSummary = (value) => {
    onChange({ ...data, summary: value });
  };

  const updateSkills = (value) => {
    const skillsArray = value.split(',').map((s) => s.trim()).filter(Boolean);
    onChange({ ...data, skills: skillsArray });
  };

  const updateArrayField = (section, index, field, value) => {
    const newArray = [...(data[section] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    onChange({ ...data, [section]: newArray });
  };

  const addArrayItem = (section, emptyItem) => {
    onChange({ ...data, [section]: [...(data[section] || []), emptyItem] });
  };

  const removeArrayItem = (section, index) => {
    const newArray = [...(data[section] || [])];
    newArray.splice(index, 1);
    onChange({ ...data, [section]: newArray });
  };

  const updateBullet = (expIndex, bulletIndex, text) => {
    const newExp = [...(data.experience || [])];
    newExp[expIndex].bullets[bulletIndex] = { text, rewritten: '' };
    onChange({ ...data, experience: newExp });
  };

  const addBullet = (expIndex) => {
    const newExp = [...(data.experience || [])];
    if (!newExp[expIndex].bullets) newExp[expIndex].bullets = [];
    newExp[expIndex].bullets.push({ text: '', rewritten: '' });
    onChange({ ...data, experience: newExp });
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const newExp = [...(data.experience || [])];
    newExp[expIndex].bullets.splice(bulletIndex, 1);
    onChange({ ...data, experience: newExp });
  };

  const renderSectionHeader = (id, title) => (
    <div
      className="flex items-center justify-between p-4 cursor-pointer bg-slate-800/50 hover:bg-slate-800/80 transition-colors border-b border-slate-700/50"
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
    >
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      {activeSection === id ? (
        <ChevronUp className="h-5 w-5 text-slate-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-slate-400" />
      )}
    </div>
  );

  const Input = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-slate-700/50">
      {/* Personal Info */}
      <div>
        {renderSectionHeader('personalInfo', 'Personal Information')}
        {activeSection === 'personalInfo' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Full Name"
              value={data.personalInfo?.fullName}
              onChange={(val) => updateField('personalInfo', 'fullName', val)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={data.personalInfo?.email}
              onChange={(val) => updateField('personalInfo', 'email', val)}
              required
            />
            <Input
              label="Phone"
              value={data.personalInfo?.phone}
              onChange={(val) => updateField('personalInfo', 'phone', val)}
            />
            <Input
              label="Location"
              value={data.personalInfo?.location}
              onChange={(val) => updateField('personalInfo', 'location', val)}
            />
            <Input
              label="LinkedIn URL"
              value={data.personalInfo?.linkedin}
              onChange={(val) => updateField('personalInfo', 'linkedin', val)}
            />
            <Input
              label="GitHub/Portfolio URL"
              value={data.personalInfo?.github}
              onChange={(val) => updateField('personalInfo', 'github', val)}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div>
        {renderSectionHeader('summary', 'Professional Summary')}
        {activeSection === 'summary' && (
          <div className="p-5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Summary
            </label>
            <textarea
              value={data.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              rows={4}
              placeholder="A brief summary of your professional background and goals..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        )}
      </div>

      {/* Experience */}
      <div>
        {renderSectionHeader('experience', 'Experience')}
        {activeSection === 'experience' && (
          <div className="p-5 space-y-6">
            {(data.experience || []).map((exp, idx) => (
              <div key={idx} className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 relative">
                <button
                  onClick={() => removeArrayItem('experience', idx)}
                  className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 pr-8">
                  <Input
                    label="Role/Title"
                    value={exp.role}
                    onChange={(val) => updateArrayField('experience', idx, 'role', val)}
                    required
                  />
                  <Input
                    label="Company"
                    value={exp.company}
                    onChange={(val) => updateArrayField('experience', idx, 'company', val)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Start Date"
                      placeholder="e.g. Jan 2020"
                      value={exp.startDate}
                      onChange={(val) => updateArrayField('experience', idx, 'startDate', val)}
                    />
                    <Input
                      label="End Date"
                      placeholder="e.g. Present"
                      value={exp.endDate}
                      onChange={(val) => updateArrayField('experience', idx, 'endDate', val)}
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) => updateArrayField('experience', idx, 'current', e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                      />
                      I currently work here
                    </label>
                  </div>
                </div>

                {/* Bullets */}
                <div className="mt-4">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Bullet Points
                  </label>
                  <div className="space-y-3">
                    {(exp.bullets || []).map((bullet, bIdx) => {
                      return (
                        <div key={bIdx} className="space-y-2">
                          <div className="flex gap-2 items-start">
                            <span className="text-slate-500 mt-2">•</span>
                            <textarea
                              value={bullet.text || (typeof bullet === 'string' ? bullet : '')}
                              onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                              rows={2}
                              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                              placeholder="Describe your achievement..."
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => removeBullet(idx, bIdx)}
                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Remove bullet"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => addBullet(idx)}
                    >
                      Add Bullet Point
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              icon={Plus}
              className="w-full border-dashed"
              onClick={() => addArrayItem('experience', { role: '', company: '', startDate: '', endDate: '', current: false, bullets: [] })}
            >
              Add Experience
            </Button>
          </div>
        )}
      </div>

      {/* Education */}
      <div>
        {renderSectionHeader('education', 'Education')}
        {activeSection === 'education' && (
          <div className="p-5 space-y-4">
            {(data.education || []).map((edu, idx) => (
              <div key={idx} className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 relative">
                <button
                  onClick={() => removeArrayItem('education', idx)}
                  className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 pr-8">
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(val) => updateArrayField('education', idx, 'institution', val)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Degree"
                      placeholder="e.g. BS"
                      value={edu.degree}
                      onChange={(val) => updateArrayField('education', idx, 'degree', val)}
                    />
                    <Input
                      label="Field of Study"
                      placeholder="e.g. Computer Science"
                      value={edu.field}
                      onChange={(val) => updateArrayField('education', idx, 'field', val)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                    <Input
                      label="Start Date"
                      value={edu.startDate}
                      onChange={(val) => updateArrayField('education', idx, 'startDate', val)}
                    />
                    <Input
                      label="End Date"
                      value={edu.endDate}
                      onChange={(val) => updateArrayField('education', idx, 'endDate', val)}
                    />
                    <Input
                      label="GPA (Optional)"
                      value={edu.gpa}
                      onChange={(val) => updateArrayField('education', idx, 'gpa', val)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              icon={Plus}
              className="w-full border-dashed"
              onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}
            >
              Add Education
            </Button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div>
        {renderSectionHeader('skills', 'Skills')}
        {activeSection === 'skills' && (
          <div className="p-5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Technical & Professional Skills (Comma Separated)
            </label>
            <textarea
              value={(data.skills || []).join(', ')}
              onChange={(e) => updateSkills(e.target.value)}
              rows={3}
              placeholder="React, Node.js, TypeScript, Project Management..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        {renderSectionHeader('projects', 'Projects')}
        {activeSection === 'projects' && (
          <div className="p-5 space-y-4">
            {(data.projects || []).map((proj, idx) => (
              <div key={idx} className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 relative">
                <button
                  onClick={() => removeArrayItem('projects', idx)}
                  className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 pr-8 mb-2">
                  <Input
                    label="Project Name"
                    value={proj.name}
                    onChange={(val) => updateArrayField('projects', idx, 'name', val)}
                    required
                  />
                  <Input
                    label="Tech Stack"
                    placeholder="e.g. MERN, Tailwind"
                    value={proj.techStack}
                    onChange={(val) => updateArrayField('projects', idx, 'techStack', val)}
                  />
                </div>
                <div className="pr-8">
                  <Input
                    label="Project Link (Optional)"
                    value={proj.link}
                    onChange={(val) => updateArrayField('projects', idx, 'link', val)}
                  />
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 mt-2">
                    Description
                  </label>
                  <textarea
                    value={proj.description || ''}
                    onChange={(e) => updateArrayField('projects', idx, 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              icon={Plus}
              className="w-full border-dashed"
              onClick={() => addArrayItem('projects', { name: '', description: '', techStack: '', link: '' })}
            >
              Add Project
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ResumeForm;
