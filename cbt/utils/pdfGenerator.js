const PDFDocument = require('pdfkit');

function generateResultPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, doc.page.width, 120).fill('#1a4d2e');
      doc.fontSize(24).fillColor('#f5c518').text('FUADSI', 50, 30, { align: 'center' });
      doc.fontSize(10).fillColor('#ffffff')
        .text('Federal University of Agriculture and Development Studies, Iragbiji', 50, 60, { align: 'center' });
      doc.fontSize(14).fillColor('#f5c518')
        .text('EXAMINATION RESULT SLIP', 50, 85, { align: 'center' });

      // Student info
      doc.fillColor('#1c2b1e');
      const y = 140;
      doc.fontSize(11);
      doc.text('Student Name:', 50, y).text(data.studentName, 200, y);
      doc.text('Matric Number:', 50, y + 22).text(data.matric, 200, y + 22);
      doc.text('Department:', 50, y + 44).text(data.department, 200, y + 44);
      doc.text('Level:', 50, y + 66).text(data.level || 'N/A', 200, y + 66);

      // Divider
      doc.moveTo(50, y + 100).lineTo(545, y + 100).stroke('#2e7d4f');

      // Exam info
      const ey = y + 120;
      doc.fontSize(14).fillColor('#1a4d2e').text('Examination Details', 50, ey);
      doc.fontSize(11).fillColor('#1c2b1e');
      doc.text('Course:', 50, ey + 28).text(`${data.courseCode} — ${data.courseTitle}`, 200, ey + 28);
      doc.text('Date:', 50, ey + 50).text(new Date(data.date).toLocaleDateString('en-NG', {
        year: 'numeric', month: 'long', day: 'numeric'
      }), 200, ey + 50);

      // Score box
      const sy = ey + 90;
      doc.rect(50, sy, 495, 100).fill('#e8f5ee').stroke('#2e7d4f');
      doc.fontSize(12).fillColor('#1a4d2e');
      doc.text('Total Questions:', 70, sy + 15).text(String(data.totalQuestions), 250, sy + 15);
      doc.text('Correct Answers:', 70, sy + 37).text(String(data.correctAnswers), 250, sy + 37);
      doc.text('Score:', 70, sy + 59).text(`${data.percentage}%`, 250, sy + 59);
      doc.fontSize(16).fillColor(data.percentage >= 50 ? '#2e7d4f' : '#d32f2f');
      doc.text(`Grade: ${data.grade}`, 350, sy + 35);

      // Footer
      const fy = sy + 130;
      doc.fontSize(9).fillColor('#5a6e5c');
      doc.text('This is a computer-generated result slip. No signature required.', 50, fy, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString('en-NG')}`, 50, fy + 15, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateResultPDF };
