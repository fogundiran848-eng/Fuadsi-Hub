const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Question = require('../models/Question');
const Result = require('../models/Result');
const ExamSession = require('../models/ExamSession');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// ── STUDENT MANAGEMENT ────────────────────────────

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { matric: { $regex: escaped, $options: 'i' } }
      ];
    }
    const students = await User.find(filter).select('-password').sort({ matric: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// POST /api/admin/students — create student
router.post('/students', [
  body('matric').trim().notEmpty(),
  body('name').trim().notEmpty(),
  body('department').trim().notEmpty(),
  body('password').isLength({ min: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { matric, name, department, level, password } = req.body;
    const existing = await User.findOne({ matric: matric.trim() });
    if (existing) return res.status(400).json({ error: 'Matric already exists.' });

    const student = new User({ matric: matric.trim(), name, department, level: level || '100', password, role: 'student' });
    await student.save();
    res.status(201).json(student.toSafeJSON());
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student.' });
  }
});

// PUT /api/admin/students/:id
router.put('/students/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.department) updates.department = req.body.department;
    if (req.body.level) updates.level = req.body.level;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    const student = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

// DELETE /api/admin/students/:id
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// POST /api/admin/students/bulk — bulk create students
router.post('/students/bulk', [
  body('students').isArray({ min: 1 })
], async (req, res) => {
  try {
    const { students } = req.body;
    const results = { created: 0, errors: [] };

    for (const s of students) {
      try {
        const existing = await User.findOne({ matric: s.matric });
        if (existing) {
          results.errors.push({ matric: s.matric, error: 'Already exists' });
          continue;
        }
        const student = new User({
          matric: s.matric,
          name: s.name,
          department: s.department,
          level: s.level || '100',
          password: s.password || s.matric, // default password = matric
          role: 'student'
        });
        await student.save();
        results.created++;
      } catch (e) {
        results.errors.push({ matric: s.matric, error: e.message });
      }
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Bulk creation failed.' });
  }
});

// ── COURSE MANAGEMENT ─────────────────────────────

// GET /api/admin/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// POST /api/admin/courses — create course
router.post('/courses', [
  body('courseId').trim().notEmpty(),
  body('title').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('department').trim().notEmpty(),
  body('units').isInt({ min: 1 }),
  body('duration').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { courseId, title, code, department, units, duration, status, allowRetake } = req.body;
    const existing = await Course.findOne({ courseId: courseId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Course ID already exists.' });

    const course = new Course({
      courseId: courseId.toUpperCase(),
      title, code, department,
      units, duration,
      status: status || 'pending',
      allowRetake: allowRetake || false
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course.' });
  }
});

// PUT /api/admin/courses/:courseId
router.put('/courses/:courseId', async (req, res) => {
  try {
    const updates = {};
    ['title', 'code', 'department', 'units', 'duration', 'status', 'allowRetake'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const course = await Course.findOneAndUpdate(
      { courseId: req.params.courseId.toUpperCase() },
      updates,
      { new: true }
    );
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

// DELETE /api/admin/courses/:courseId
router.delete('/courses/:courseId', async (req, res) => {
  try {
    const cid = req.params.courseId.toUpperCase();
    await Course.findOneAndDelete({ courseId: cid });
    await Question.deleteMany({ courseId: cid });
    res.json({ message: 'Course and its questions deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// ── QUESTION MANAGEMENT ───────────────────────────

// GET /api/admin/questions/:courseId
router.get('/questions/:courseId', async (req, res) => {
  try {
    const questions = await Question.find({ courseId: req.params.courseId.toUpperCase() });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

// POST /api/admin/questions — add single question
router.post('/questions', [
  body('courseId').trim().notEmpty(),
  body('q').trim().notEmpty(),
  body('options').isArray({ min: 2 }),
  body('a').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { courseId, q, options, a } = req.body;
    if (a >= options.length) {
      return res.status(400).json({ error: 'Answer index out of range.' });
    }

    const question = new Question({
      courseId: courseId.toUpperCase(), q, options, a
    });
    await question.save();

    // Update total questions count
    const count = await Question.countDocuments({ courseId: courseId.toUpperCase() });
    await Course.findOneAndUpdate({ courseId: courseId.toUpperCase() }, { totalQuestions: count });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question.' });
  }
});

// POST /api/admin/questions/bulk — bulk upload questions (JSON)
router.post('/questions/bulk', [
  body('courseId').trim().notEmpty(),
  body('questions').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { courseId, questions } = req.body;
    const cid = courseId.toUpperCase();
    let added = 0;
    const errs = [];

    for (const item of questions) {
      try {
        if (!item.q || !item.options || item.a === undefined) {
          errs.push({ q: item.q || 'unknown', error: 'Missing required fields' });
          continue;
        }
        if (item.a >= item.options.length) {
          errs.push({ q: item.q, error: 'Answer index out of range' });
          continue;
        }
        await new Question({ courseId: cid, q: item.q, options: item.options, a: item.a }).save();
        added++;
      } catch (e) {
        errs.push({ q: item.q || 'unknown', error: e.message });
      }
    }

    const count = await Question.countDocuments({ courseId: cid });
    await Course.findOneAndUpdate({ courseId: cid }, { totalQuestions: count });

    res.json({ added, errors: errs, totalQuestions: count });
  } catch (err) {
    res.status(500).json({ error: 'Bulk upload failed.' });
  }
});

// PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.q) updates.q = req.body.q;
    if (req.body.options) updates.options = req.body.options;
    if (req.body.a !== undefined) updates.a = req.body.a;

    const question = await Question.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question.' });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    const count = await Question.countDocuments({ courseId: question.courseId });
    await Course.findOneAndUpdate({ courseId: question.courseId }, { totalQuestions: count });

    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question.' });
  }
});

// ── RESULTS MANAGEMENT ────────────────────────────

// GET /api/admin/results — all results
router.get('/results', async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.courseId = req.query.courseId.toUpperCase();

    const results = await Result.find(filter)
      .populate('studentId', 'matric name department level')
      .sort({ createdAt: -1 });

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
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
});

// DELETE /api/admin/results/:id — reset a student's result (allow retake)
router.delete('/results/:id', async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Result not found.' });

    // Also reset the exam session
    await ExamSession.findByIdAndUpdate(result.sessionId, { submitted: false });

    res.json({ message: 'Result deleted. Student can retake the exam.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete result.' });
  }
});

// POST /api/admin/results/reset — reset result by student matric + courseId
router.post('/results/reset', [
  body('matric').trim().notEmpty(),
  body('courseId').trim().notEmpty()
], async (req, res) => {
  try {
    const { matric, courseId } = req.body;
    const student = await User.findOne({ matric: matric.trim() });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const result = await Result.findOneAndDelete({
      studentId: student._id,
      courseId: courseId.toUpperCase()
    });

    if (!result) return res.status(404).json({ error: 'No result found for this student/course.' });

    await ExamSession.deleteMany({
      studentId: student._id,
      courseId: courseId.toUpperCase()
    });

    res.json({ message: `Result reset for ${student.name} (${matric}) in ${courseId}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset result.' });
  }
});

// GET /api/admin/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [studentCount, courseCount, questionCount, resultCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Question.countDocuments(),
      Result.countDocuments()
    ]);
    res.json({ studentCount, courseCount, questionCount, resultCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;
