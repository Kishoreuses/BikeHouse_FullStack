const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_output.pdf'));

doc.fontSize(24).text('Test PDF', { align: 'center' });
doc.moveDown();
doc.text('Image below:');

const imgPath = './uploads/1753783101045.jpg'; // Just picking an existing image
if (fs.existsSync(imgPath)) {
  console.log('Y before image:', doc.y);
  doc.image(imgPath, {
    fit: [400, 300],
    align: 'center',
    valign: 'center'
  });
  console.log('Y after image:', doc.y);
  doc.moveDown();
  console.log('Y after moveDown:', doc.y);
  doc.text('Text after image 1');
} else {
  doc.text('Image not found: ' + imgPath);
}

doc.end();
