const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_output3.pdf'));

const images = [
    '/uploads/1753783101045.jpg',
    '/uploads/1753783101062.jpg'
];

doc.fontSize(24).text('Test PDF', { align: 'center' });
doc.moveDown();
doc.text('Images below:');

for (const img of images) {
  // Fix the path to point to backend/uploads
  const imgPath = path.join(__dirname, 'uploads', path.basename(img));
  console.log('Checking:', imgPath, 'Exists:', fs.existsSync(imgPath));
  
  if (fs.existsSync(imgPath)) {
    // Width that spans the whole printable area
    const printableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    
    // Y position before drawing
    const startY = doc.y;
    console.log('Drawing image at Y:', startY);
    
    doc.image(imgPath, {
      fit: [printableWidth, 300],
      align: 'center',
      valign: 'center'
    });
    
    const endY = doc.y;
    console.log('After image Y:', endY);
    doc.moveDown();
    console.log('After movedown Y:', doc.y);
  }
}

doc.end();
console.log('Done test_output3');
