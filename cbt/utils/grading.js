function calculateGrade(percentage) {
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
}

function getResultMessage(percentage) {
  if (percentage >= 70) return 'Excellent work!';
  if (percentage >= 60) return 'Very good performance!';
  if (percentage >= 50) return 'Good effort! Keep studying.';
  if (percentage >= 40) return 'Fair. More effort needed.';
  return 'Keep practicing, you will improve!';
}

module.exports = { calculateGrade, getResultMessage };
