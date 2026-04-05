import mammoth from 'mammoth';

// Simple PDF text extraction without external libraries
export async function extractText(fileBuffer, fileType) {
  try {
    console.log('Extracting text from file type:', fileType);
    
    if (fileType === 'application/pdf') {
      return await extractSimplePDFText(fileBuffer);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractDOCXText(fileBuffer);
    } else if (fileType === 'text/plain') {
      return new TextDecoder().decode(fileBuffer);
    }
    
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

// Simple PDF text extraction that works in Cloudflare Workers
async function extractSimplePDFText(buffer) {
  try {
    console.log('Using simple PDF text extraction...');
    
    // Convert buffer to string
    const text = new TextDecoder().decode(buffer);
    
    // Method 1: Extract text between parentheses (common in PDFs)
    const parentheticalMatches = text.match(/\(([^)]{3,})\)/g) || [];
    const extractedFromParens = parentheticalMatches
      .map(match => match.slice(1, -1))
      .filter(t => t.length > 3 && !t.includes('\\') && !t.includes('/CID'))
      .join(' ');
    
    // Method 2: Extract text after 'TJ' and 'Tj' operators
    const tjMatches = text.match(/\(([^)]+)\)/g) || [];
    const extractedFromOps = tjMatches
      .map(match => match.slice(1, -1))
      .filter(t => t.length > 3 && !t.match(/^[0-9\s]+$/))
      .join(' ');
    
    // Method 3: Look for readable text chunks
    const readableText = text
      .split(/[\n\r]/)
      .filter(line => {
        // Filter lines that look like readable text
        const trimmed = line.trim();
        return trimmed.length > 10 && 
               !trimmed.startsWith('%') && 
               !trimmed.startsWith('/') &&
               !trimmed.match(/^[0-9\s]+$/) &&
               trimmed.includes(' ');
      })
      .join('\n');
    
    // Combine all methods
    let extractedText = [
      extractedFromParens,
      extractedFromOps,
      readableText
    ].join(' ').replace(/\s+/g, ' ').trim();
    
    // If we got meaningful text, return it
    if (extractedText.length > 100) {
      console.log(`Simple PDF extraction successful: ${extractedText.length} chars`);
      return extractedText;
    }
    
    // Fallback: Return filename with placeholder
    return `[PDF Document - For full text extraction, please convert to TXT or DOCX format. Sample extracted content: ${extractedText.substring(0, 300)}]`;
    
  } catch (error) {
    console.error('Simple PDF extraction error:', error);
    return '[PDF text extraction failed - please try a TXT or DOCX file for better results]';
  }
}

async function extractDOCXText(buffer) {
  try {
    console.log('Extracting DOCX text with mammoth...');
    
    // mammoth works well in worker environments
    const result = await mammoth.extractRawText({ 
      buffer: Buffer.from(buffer) 
    });
    
    console.log(`DOCX extracted, length: ${result.value.length}`);
    return result.value || '[No text content found in DOCX]';
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract DOCX text: ${error.message}`);
  }
}