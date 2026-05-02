const express = require('express');
const Result = require('../models/Result');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateResultPDF } = require('../utils/pdfGenerator');

const router = express.Router();

// GET /api/results — student's own results
router.get('/', auth, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });

    // Enrich with course info
    const enriched = await Promise.all(results.map(async r => {
      const course = await Course.findOne({ courseId: r.courseId });
      return {
        ...r.toObject(),
        courseTitle: course ? course.title : r.courseId,
        courseCode: course ? course.code : r.courseId
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Results error:', err);
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
});

// GET /api/results/:courseId — student's result for a specific course
router.get('/:courseId', auth, async (req, res) => {
  try {
    const result = await Result.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId.toUpperCase()
    });
    if (!result) {
      return res.status(404).json({ error: 'No result found for this course.' });
    }

    const course = await Course.findOne({ courseId: result.courseId });
    res.json({
      ...result.toObject(),
      courseTitle: course ? course.title : result.courseId,
      courseCode: course ? course.code : result.courseId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch result.' });
  }
});

// GET /api/results/:courseId/pdf — download PDF result slip
router.get('/:courseId/pdf', auth, async (req, res) => {
  try {
    const result = await Result.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId.toUpperCase()
    });
    if (!result) {
      return res.status(404).json({ error: 'No result found.' });
    }

    const course = await Course.findOne({ courseId: result.courseId });
    const student = await User.findById(req.user._id);

    const pdfBuffer = await generateResultPDF({
      studentName: student.name,
      matric: student.matric,
      department: student.department,
      level: student.level,
      courseCode: course ? course.code : result.courseId,
      courseTitle: course ? course.title : result.courseId,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      percentage: result.percentage,
      grade: result.grade,
      date: result.createdAt
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="Result_${student.matric}_${result.courseId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});

module.exports = router;
