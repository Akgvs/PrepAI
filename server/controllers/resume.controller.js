import Resume from '../models/Resume.model.js';
import { incrementQuota } from '../services/usage.service.js';
import {
  scoreResumeATS,
  rewriteBulletSTAR,
} from '../services/gemini.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * POST /api/resumes — Create a new resume
 */
export const createResume = async (req, res, next) => {
  try {
    const resumeData = {
      user: req.user?._id,
      clerkUserId: req.auth.userId,
      title: req.body.title || 'Untitled Resume',
      targetRole: req.body.targetRole || '',
      personalInfo: req.body.personalInfo || {},
      summary: req.body.summary || '',
      experience: req.body.experience || [],
      education: req.body.education || [],
      skills: req.body.skills || [],
      projects: req.body.projects || [],
      certifications: req.body.certifications || [],
    };

    const resume = await Resume.create(resumeData);

    // Track usage
    await incrementQuota(req.auth.userId, 'resumesCreated');

    res
      .status(201)
      .json(ApiResponse.success(resume, 'Resume created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes — List all resumes for the user
 */
export const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ clerkUserId: req.auth.userId })
      .sort({ updatedAt: -1 })
      .select('title targetRole status atsScore.overall personalInfo.fullName updatedAt createdAt');

    res.json(ApiResponse.success(resumes));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes/:id — Get a single resume by ID
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    res.json(ApiResponse.success(resume));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/resumes/:id — Update a resume
 */
export const updateResume = async (req, res, next) => {
  try {
    const allowedFields = [
      'title',
      'targetRole',
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, clerkUserId: req.auth.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    res.json(ApiResponse.success(resume, 'Resume updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resumes/:id — Delete a resume
 */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    res.json(ApiResponse.success(null, 'Resume deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resumes/:id/score — Run ATS scoring via Gemini AI
 */
export const scoreResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    const atsResult = await scoreResumeATS({
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      certifications: resume.certifications,
      targetRole: resume.targetRole,
    });

    resume.atsScore = {
      overall: atsResult.overall ?? 0,
      sections: atsResult.sections || {},
      suggestions: atsResult.suggestions || [],
      keywords: atsResult.keywords || [],
    };
    resume.status = 'scored';

    await resume.save();

    res.json(
      ApiResponse.success(
        { atsScore: resume.atsScore },
        'ATS score generated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resumes/:id/rewrite-bullet — Rewrite a single bullet with STAR method
 */
export const rewriteBullet = async (req, res, next) => {
  try {
    const { experienceIndex, bulletIndex } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    const exp = resume.experience?.[experienceIndex];
    if (!exp) {
      throw ApiError.badRequest('Experience entry not found');
    }

    const bullet = exp.bullets?.[bulletIndex];
    if (!bullet) {
      throw ApiError.badRequest('Bullet point not found');
    }

    const result = await rewriteBulletSTAR({
      bullet: bullet.text,
      role: exp.role,
      company: exp.company,
    });

    // Save the rewritten text
    resume.experience[experienceIndex].bullets[bulletIndex].rewritten =
      result.rewritten || bullet.text;

    await resume.save();

    res.json(
      ApiResponse.success(
        {
          original: bullet.text,
          rewritten: result.rewritten,
          experienceIndex,
          bulletIndex,
        },
        'Bullet rewritten with STAR method'
      )
    );
  } catch (error) {
    next(error);
  }
};
