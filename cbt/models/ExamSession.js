const mongoose = require('mongoose');

const examSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  submitted: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date
  },
  answers: {
    type: Map,
    of: Number,
    default: {}
  },
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  suspiciousActivities: [{
    type: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: String
  }],
  questionOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

examSessionSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('ExamSession', examSessionSchema);
