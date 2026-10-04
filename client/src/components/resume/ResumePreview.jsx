import React, { forwardRef } from 'react';

const ResumePreview = forwardRef(({ data }, ref) => {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
  } = data;

  return (
    <div
      ref={ref}
      className="bg-white text-black p-8 mx-auto shadow-sm"
      style={{
        width: '210mm',
        minHeight: '297mm', // A4 Size
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header / Personal Info */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-1 text-slate-900">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-sm text-slate-700 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && (
            <a href={personalInfo.linkedin} className="text-indigo-600">
              LinkedIn
            </a>
          )}
          {personalInfo.github && (
            <a href={personalInfo.github} className="text-indigo-600">
              GitHub
            </a>
          )}
          {personalInfo.portfolio && (
            <a href={personalInfo.portfolio} className="text-indigo-600">
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-widest">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 tracking-widest">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-slate-800">
                    {exp.role} <span className="font-normal text-slate-600">at {exp.company}</span>
                  </h3>
                  <span className="text-xs text-slate-600 font-medium">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {exp.bullets.map((b, bIdx) => {
                      const text = typeof b === 'string' ? b : b.rewritten || b.text;
                      return (
                        <li key={bIdx} className="text-xs text-slate-700 leading-relaxed">
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 tracking-widest">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{edu.institution}</h3>
                  <p className="text-xs text-slate-700">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                    {edu.gpa && ` (GPA: ${edu.gpa})`}
                  </p>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-widest">
            Skills
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {skills.join(', ')}
          </p>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 tracking-widest">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-800">{proj.name}</h3>
                  {proj.techStack && (
                    <span className="text-xs text-slate-600 italic">| {proj.techStack}</span>
                  )}
                  {proj.link && (
                    <a href={proj.link} className="text-xs text-indigo-600 ml-auto">
                      Link
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 tracking-widest">
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{cert.name}</h3>
                  {cert.issuer && <p className="text-xs text-slate-700">{cert.issuer}</p>}
                </div>
                {cert.date && (
                  <span className="text-xs text-slate-600 font-medium">{cert.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
