const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Question = require('../models/Question');
const ExamSession = require('../models/ExamSession');
const Result = require('../models/Result');
const { auth } = require('../middleware/auth');
const { calculateGrade, getResultMessage } = require('../utils/grading');

const router = express.Router();

// POST /api/exam/start — start an exam session
router.post('/start', auth, [
  body('courseId').trim().notEmpty().withMessage('Course ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { courseId } = req.body;
    const upperCourseId = courseId.toUpperCase();

    // Find course
    const course = await Course.findOne({ courseId: upperCourseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Enforce department access
    if (req.user.department !== course.department) {
      return res.status(403).json({ error: 'You are not enrolled in this course.' });
    }

    // Check course is active
    if (course.status !== 'active') {
      return res.status(400).json({ error: 'This exam is not currently active.' });
    }

    // Check if already submitted (prevent retake unless allowed)
    const existingResult = await Result.findOne({
      studentId: req.user._id,
      courseId: upperCourseId
    });
    if (existingResult && !course.allowRetake) {
      return res.status(400).json({ error: 'You have already completed this exam.' });
    }

    // Check for active session
    const activeSession = await ExamSession.findOne({
      studentId: req.user._id,
      courseId: upperCourseId,
      submitted: false
    });
    if (activeSession) {
      // Resume existing session
      const questions = await Question.find({
        _id: { $in: activeSession.questionOrder }
      }).select('-a');

      // Maintain original order
      const orderedQuestions = activeSession.questionOrder.map(id =>
        questions.find(q => q._id.toString() === id.toString())
      ).filter(Boolean);

      const now = new Date();
      const elapsed = Math.floor((now - activeSession.startTime) / 1000);
      const remaining = Math.max(0, course.duration * 60 - elapsed);

      if (remaining <= 0) {
        // Auto-submit expired session and score saved answers
        activeSession.submitted = true;
        activeSession.submittedAt = now;
        await activeSession.save();

        // Score any saved answers
        const questionsWithAnswers = await Question.find({
          _id: { $in: activeSession.questionOrder }
        });
        const savedAnswers = Object.fromEntries(activeSession.answers || new Map());
        let correctCount = 0;
        questionsWithAnswers.forEach(q => {
          const qId = q._id.toString();
          if (savedAnswers[qId] !== undefined && savedAnswers[qId] === q.a) {
            correctCount++;
          }
        });
        const pct = questionsWithAnswers.length > 0
          ? Math.round((correctCount / questionsWithAnswers.length) * 100) : 0;
        const grd = calculateGrade(pct);

        // Remove old result if retake
        if (course.allowRetake) {
          await Result.deleteMany({ studentId: req.user._id, courseId: upperCourseId });
        }
        const existingExpiredResult = await Result.findOne({
          studentId: req.user._id, courseId: upperCourseId
        });
        if (!existingExpiredResult) {
          await new Result({
            studentId: req.user._id,
            courseId: upperCourseId,
            sessionId: activeSession._id,
            totalQuestions: questionsWithAnswers.length,
            correctAnswers: correctCount,
            score: correctCount,
            percentage: pct,
            grade: grd,
            tabSwitchCount: activeSession.tabSwitchCount || 0
          }).save();
        }

        return res.status(400).json({
          error: 'Your exam session has expired. Your saved answers have been scored.',
          scored: true, percentage: pct, grade: grd
        });
      }

      return res.json({
        sessionId: activeSession._id,
        course: {
          courseId: course.courseId,
          title: course.title,
          code: course.code,
          duration: course.duration,
          totalQuestions: orderedQuestions.length
        },
        questions: orderedQuestions,
        timeRemaining: remaining,
        savedAnswers: Object.fromEntries(activeSession.answers || new Map()),
        resumed: true
      });
    }

    // Start new session
    const questions = await Question.find({ courseId: upperCourseId });
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No questions available for this exam.' });
    }

    const questionOrder = questions.map(q => q._id);
    const now = new Date();
    const endTime = new Date(now.getTime() + course.duration * 60 * 1000);

    const session = new ExamSession({
      studentId: req.user._id,
      courseId: upperCourseId,
      startTime: now,
      endTime,
      questionOrder
    });
    await session.save();

    // Return questions WITHOUT answer keys
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      q: q.q,
      options: q.options
    }));

    res.json({
      sessionId: session._id,
      course: {
        courseId: course.courseId,
        title: course.title,
        code: course.code,
        duration: course.duration,
        totalQuestions: safeQuestions.length
      },
      questions: safeQuestions,
      timeRemaining: course.duration * 60,
      savedAnswers: {},
      resumed: false
    });
  } catch (err) {
    console.error('Start exam error:', err);
    res.status(500).json({ error: 'Failed to start exam.' });
  }
});

// POST /api/exam/submit — submit exam answers
router.post('/submit', auth, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('answers').isObject().withMessage('Answers must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { sessionId, answers, tabSwitchCount } = req.body;

    const session = await ExamSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Exam session not found.' });
    }
    if (session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your exam session.' });
    }
    if (session.submitted) {
      return res.status(400).json({ error: 'Exam already submitted.' });
    }

    // Validate server-side duration
    const now = new Date();
    const gracePeriod = 30 * 1000; // 30 seconds grace
    if (now > new Date(session.endTime.getTime() + gracePeriod)) {
      session.submitted = true;
      session.submittedAt = now;
      await session.save();
      return res.status(400).json({ error: 'Exam time has expired.' });
    }

    // Get correct answers from DB
    const questions = await Question.find({
      _id: { $in: session.questionOrder }
    });

    const answerMap = {};
    questions.forEach(q => { answerMap[q._id.toString()] = q.a; });

    // Score the exam
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach(q => {
      const qId = q._id.toString();
      const studentAnswer = answers[qId];
      if (studentAnswer !== undefined && studentAnswer === answerMap[qId]) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const grade = calculateGrade(percentage);

    // Update session
    session.submitted = true;
    session.submittedAt = now;
    session.answers = answers;
    session.tabSwitchCount = tabSwitchCount || 0;
    await session.save();

    // If retaking, remove old result
    const course = await Course.findOne({ courseId: session.courseId });
    if (course && course.allowRetake) {
      await Result.deleteMany({
        studentId: req.user._id,
        courseId: session.courseId
      });
    }

    // Save result
    const result = new Result({
      studentId: req.user._id,
      courseId: session.courseId,
      sessionId: session._id,
      totalQuestions,
      correctAnswers: correctCount,
      score: correctCount,
      percentage,
      grade,
      tabSwitchCount: tabSwitchCount || 0
    });
    await result.save();

    res.json({
      totalQuestions,
      correctAnswers: correctCount,
      percentage,
      grade,
      message: getResultMessage(percentage)
    });
  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ error: 'Failed to submit exam.' });
  }
});

// POST /api/exam/save-progress — save answers mid-exam
router.post('/save-progress', auth, [
  body('sessionId').notEmpty(),
  body('answers').isObject()
], async (req, res) => {
  try {
    const { sessionId, answers, tabSwitchCount } = req.body;
    const session = await ExamSession.findById(sessionId);
    if (!session || session.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    if (session.submitted) {
      return res.status(400).json({ error: 'Exam already submitted.' });
    }

    session.answers = answers;
    if (tabSwitchCount !== undefined) {
      session.tabSwitchCount = tabSwitchCount;
    }
    await session.save();
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress.' });
  }
});

// POST /api/exam/log-activity — log suspicious activity
router.post('/log-activity', auth, [
  body('sessionId').notEmpty(),
  body('activityType').notEmpty(),
  body('details').optional()
], async (req, res) => {
  try {
    const { sessionId, activityType, details } = req.body;
    const session = await ExamSession.findById(sessionId);
    if (!session || session.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    session.suspiciousActivities.push({
      type: activityType,
      timestamp: new Date(),
      details: details || ''
    });

    if (activityType === 'tab_switch') {
      session.tabSwitchCount = (session.tabSwitchCount || 0) + 1;
    }

    await session.save();
    res.json({ logged: true, tabSwitchCount: session.tabSwitchCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log activity.' });
  }
});

module.exports = router;
