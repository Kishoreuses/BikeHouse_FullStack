const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_output2.pdf'));

const images = [
    '/uploads/1753783101045.jpg',
    '/uploads/1753783101062.jpg'
];

doc.fontSize(24).text('Test PDF', { align: 'center' });
doc.moveDown();
doc.text('Images below:');

console.log('__dirname:', __dirname);
for (const img of images) {
  const imgPath = path.join(__dirname, '..', 'uploads', path.basename(img));
  console.log('Checking:', imgPath, 'Exists:', fs.existsSync(imgPath));
  if (fs.existsSync(imgPath)) {
    // Determine the available width for content (ignoring margins)
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    
    // Add image that fits in the available width and is centered
    doc.image(imgPath, {
      fit: [contentWidth, 300],
      align: 'center',
      valign: 'center'
    });
    doc.moveDown();
  }
}

doc.end();
console.log('Done test_output2');
