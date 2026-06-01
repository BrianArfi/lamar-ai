import { writeFileSync } from 'fs';
import JSZip from 'jszip';

async function makeDocx() {
  const zip = new JSZip();
  
  zip.file('[Content_Types].xml', 
    `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
  );
  
  zip.folder('_rels').file('.rels',
    `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
  );
  
  zip.folder('word').file('document.xml',
    `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>DOCX Resume Test Content - Brian Johansen Senior Engineer</w:t></w:r></w:p></w:body></w:document>`
  );
  
  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  writeFileSync('/tmp/test_cv.docx', buf);
  console.log('DOCX written:', buf.length, 'bytes');
}

makeDocx();
