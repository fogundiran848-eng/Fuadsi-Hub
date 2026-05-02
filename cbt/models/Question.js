const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    index: true
  },
  q: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: arr => arr.length >= 2,
      message: 'At least 2 options required'
    }
  },
  a: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
