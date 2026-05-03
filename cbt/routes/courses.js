const express = require('express');
const { query, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses — list courses, optionally filtered by department
router.get('/', auth, [
  query('department').optional().trim()
], async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    // Students only see courses for their department
    if (req.user.role === 'student') {
      filter.department = req.user.department;
    }

    const courses = await Course.find(filter).sort({ code: 1 });

    // For students, add their exam status (available / completed)
    if (req.user.role === 'student') {
      const results = await Result.find({ studentId: req.user._id });
      const completedMap = {};
      results.forEach(r => {
        completedMap[r.courseId] = r;
      });

      const enriched = courses.map(c => {
        const obj = c.toObject();
        const result = completedMap[c.courseId];
        if (result) {
          obj.examStatus = 'done';
          obj.score = result.percentage;
          obj.grade = result.grade;
        } else {
          obj.examStatus = c.status === 'active' ? 'active' : 'pending';
        }
        return obj;
      });
      return res.json(enriched);
    }

    res.json(courses);
  } catch (err) {
    console.error('Courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// GET /api/courses/:courseId — get single course info (no answer keys)
router.get('/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: req.params.courseId.toUpperCase() });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    // Students can only view their department courses
    if (req.user.role === 'student' && course.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied to this course.' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course.' });
  }
});

module.exports = router;
