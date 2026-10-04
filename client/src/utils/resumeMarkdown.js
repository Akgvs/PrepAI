export const getContactMarkdown = (contactInfo, fullName) => {
  if (!contactInfo) return '';
  const parts = [];
  if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
  if (contactInfo.phone) parts.push(`📱 ${contactInfo.phone}`);
  if (contactInfo.location) parts.push(`📍 ${contactInfo.location}`);
  if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
  if (contactInfo.github) parts.push(`💻 [GitHub](${contactInfo.github})`);
  if (contactInfo.portfolio) parts.push(`🌐 [Portfolio](${contactInfo.portfolio})`);

  return parts.length > 0
    ? `## <div align="center">${fullName || 'Your Name'}</div>\n\n<div align="center">\n\n${parts.join(' | ')}\n\n</div>`
    : '';
};

export const entriesToMarkdown = (entries, title) => {
  if (!entries || entries.length === 0) return '';
  
  let markdown = `## ${title}\n\n`;
  
  if (title === 'Work Experience') {
    entries.forEach((exp) => {
      markdown += `### ${exp.role} at ${exp.company}\n`;
      markdown += `*${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}*\n\n`;
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet) => {
          const text = typeof bullet === 'string' ? bullet : bullet.text;
          if (text) markdown += `- ${text}\n`;
        });
        markdown += '\n';
      }
    });
  } else if (title === 'Education') {
    entries.forEach((edu) => {
      markdown += `### ${edu.institution}\n`;
      markdown += `*${edu.startDate} - ${edu.endDate}*\n\n`;
      markdown += `- **Degree**: ${edu.degree}\n`;
      if (edu.field) markdown += `- **Field**: ${edu.field}\n`;
      if (edu.gpa) markdown += `- **GPA**: ${edu.gpa}\n`;
      markdown += '\n';
    });
  } else if (title === 'Projects') {
    entries.forEach((proj) => {
      markdown += `### ${proj.name}\n`;
      if (proj.techStack) markdown += `*Tech Stack: ${proj.techStack}*\n\n`;
      if (proj.description) markdown += `${proj.description}\n\n`;
      if (proj.link) markdown += `[Project Link](${proj.link})\n\n`;
    });
  }
  
  return markdown;
};

export const generateResumeMarkdown = (data) => {
  const { personalInfo, summary, skills, experience, education, projects } = data;
  
  const sections = [
    getContactMarkdown(personalInfo, personalInfo?.fullName),
    summary && `## Professional Summary\n\n${summary}`,
    skills && skills.length > 0 && `## Skills\n\n${skills.join(', ')}`,
    entriesToMarkdown(experience, 'Work Experience'),
    entriesToMarkdown(education, 'Education'),
    entriesToMarkdown(projects, 'Projects'),
  ];
  
  return sections.filter(Boolean).join('\n\n');
};
