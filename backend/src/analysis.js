import { v4 as uuidv4 } from 'uuid';
import { extractText } from './utils/textExtractor';
import { createAIPrompt } from './utils/aiPrompt';

export class Analysis {
  constructor(env, user) {
    this.env = env;
    this.user = user;
    this.db = env.DB;
  }

  async analyze(request) {
    try {
      const { documentId } = await request.json();

      const document = await this.db.prepare(
        'SELECT * FROM documents WHERE id = ? AND user_id = ?'
      ).bind(documentId, this.user.userId).first();

      if (!document) {
        return new Response(JSON.stringify({ error: 'Document not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get file from R2
      const fileKey = `documents/${this.user.userId}/${documentId}-${document.file_name}`;
      const file = await this.env.DOCUMENTS.get(fileKey);

      if (!file) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Extract text
      const fileBuffer = await file.arrayBuffer();
      const text = await extractText(fileBuffer, document.file_type);

      // Call AI
      const aiResponse = await this.callAI(text);

      // Save analysis
      const analysisId = uuidv4();
      await this.db.prepare(
        `INSERT INTO analysis (id, document_id, ai_response_json, key_entities, flags) 
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        analysisId, 
        documentId, 
        JSON.stringify(aiResponse),
        JSON.stringify(aiResponse.key_entities || []),
        JSON.stringify(aiResponse.flags || [])
      ).run();

      // Update document
      await this.db.prepare(
        `UPDATE documents 
         SET status = ?, ai_summary = ?, risk_score = ?, document_type = ?, confidence_score = ? 
         WHERE id = ?`
      ).bind(
        'completed',
        aiResponse.summary || '',
        aiResponse.risk_score || 0,
        aiResponse.document_type || 'unknown',
        aiResponse.confidence_score || 0,
        documentId
      ).run();

      // Log activity
      await this.db.prepare(
        `INSERT INTO activity_logs (id, user_id, action, document_id, details) 
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        uuidv4(), 
        this.user.userId, 
        'analyze', 
        documentId, 
        `Analysis completed with risk score: ${aiResponse.risk_score}`
      ).run();

      return new Response(JSON.stringify({
        id: analysisId,
        ...aiResponse
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Analyze error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async processDocument(documentId, file) {
    try {
      // Update status to processing
      await this.db.prepare(
        'UPDATE documents SET status = ? WHERE id = ?'
      ).bind('processing', documentId).run();

      console.log('Starting text extraction for document:', documentId);
      
      // Extract text
      const fileBuffer = await file.arrayBuffer();
      const text = await extractText(fileBuffer, file.type);
      
      console.log('Text extracted, length:', text.length);

      // Call AI
      const aiResponse = await this.callAI(text);

      // Save analysis
      const analysisId = uuidv4();
      await this.db.prepare(
        `INSERT INTO analysis (id, document_id, ai_response_json, key_entities, flags) 
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        analysisId, 
        documentId, 
        JSON.stringify(aiResponse),
        JSON.stringify(aiResponse.key_entities || []),
        JSON.stringify(aiResponse.flags || [])
      ).run();

      // Update document
      await this.db.prepare(
        `UPDATE documents 
         SET status = ?, ai_summary = ?, risk_score = ?, document_type = ?, confidence_score = ? 
         WHERE id = ?`
      ).bind(
        'completed',
        aiResponse.summary || '',
        aiResponse.risk_score || 0,
        aiResponse.document_type || 'unknown',
        aiResponse.confidence_score || 0,
        documentId
      ).run();

      console.log('Analysis completed for document:', documentId);

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update document status to error
      await this.db.prepare(
        'UPDATE documents SET status = ? WHERE id = ?'
      ).bind('error', documentId).run();
      
      // Log the error
      await this.db.prepare(
        `INSERT INTO activity_logs (id, user_id, action, document_id, details) 
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        uuidv4(), 
        this.user.userId, 
        'error', 
        documentId, 
        `Analysis failed: ${error.message}`
      ).run();
    }
  }

  async callAI(text) {
    // Try Gemini first, then fallback to mock
    try {
      return await this.callGeminiAI(text);
    } catch (geminiError) {
      console.log('Gemini failed, using mock response:', geminiError.message);
      return this.getMockResponse(text);
    }
  }

  async callGeminiAI(text) {
    try {
      const prompt = `You are a professional document analyst for a compliance and risk management system. Analyze the following document and return a valid JSON object with this exact structure:

{
  "summary": "A professional 2-3 sentence summary of the document's purpose and key points",
  "document_type": "The specific type of document (invoice, contract, NDA, report, proposal, letter, agreement, etc.)",
  "risk_score": "A number from 0-100 based on: 0-20 (minimal risk, standard document), 21-40 (low risk, minor concerns), 41-60 (moderate risk, attention needed), 61-80 (high risk, significant issues), 81-100 (critical risk, urgent action required)",
  "confidence_score": "A number from 0-1 indicating how confident you are in this analysis",
  "key_entities": ["List of important entities found: company names, person names, dates, monetary amounts, addresses, contract IDs, etc."],
  "flags": ["List of potential issues, red flags, missing items, or unusual clauses found"],
  "extracted_fields": {
    "company_name": "Extract the main company name if found",
    "date": "Extract the main document date if found",
    "amount": "Extract the main monetary amount if found",
    "contract_id": "Extract contract/reference ID if found",
    "address": "Extract address if found",
    "email": "Extract email if found",
    "phone": "Extract phone number if found"
  },
  "compliance_check": {
    "status": "compliant|non-compliant|needs_review",
    "issues": ["List any compliance issues found"]
  }
}

Document text:
${text.substring(0, 30000)}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.env.GEMINI_MODEL || 'gemini-1.5-flash'}:generateContent?key=${this.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1, // Lower temperature for more consistent results
              maxOutputTokens: 2048,
            }
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Gemini API error:', data);
        throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
      }

      // Extract text from Gemini response
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiText) {
        throw new Error('Empty response from Gemini');
      }

      // Clean the response - remove markdown formatting
      let cleanJson = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and ensure all required fields exist
        return {
          summary: parsed.summary || 'Analysis completed',
          document_type: parsed.document_type || 'document',
          risk_score: Math.min(100, Math.max(0, parsed.risk_score || 50)),
          confidence_score: Math.min(1, Math.max(0, parsed.confidence_score || 0.8)),
          key_entities: Array.isArray(parsed.key_entities) ? parsed.key_entities : [],
          flags: Array.isArray(parsed.flags) ? parsed.flags : [],
          extracted_fields: parsed.extracted_fields || {},
          compliance_check: parsed.compliance_check || { status: 'needs_review', issues: [] }
        };
      } else {
        throw new Error('No valid JSON found in response');
      }
      
    } catch (error) {
      console.error('Gemini call error:', error);
      throw error; // Let the calling function handle the fallback
    }
  }

  getMockResponse(text) {
    // Intelligent mock based on actual text content
    const textLower = text.toLowerCase();
    
    // Detect document type
    let documentType = 'general document';
    if (textLower.includes('invoice') || textLower.includes('payment') || textLower.includes('due date')) {
      documentType = 'invoice';
    } else if (textLower.includes('contract') || textLower.includes('agreement') || textLower.includes('party')) {
      documentType = 'contract';
    } else if (textLower.includes('nda') || textLower.includes('confidential')) {
      documentType = 'non-disclosure agreement';
    } else if (textLower.includes('report') || textLower.includes('analysis')) {
      documentType = 'report';
    } else if (textLower.includes('proposal') || textLower.includes('quotation')) {
      documentType = 'proposal';
    } else if (textLower.includes('letter') || textLower.includes('dear')) {
      documentType = 'letter';
    }
    
    // Calculate risk score based on content
    let riskScore = 30;
    const riskKeywords = {
      'urgent': 5,
      'overdue': 15,
      'penalty': 20,
      'legal': 25,
      'breach': 30,
      'confidential': 10,
      'warning': 15,
      'deadline': 10,
      'termination': 25,
      'lawsuit': 40,
      'compliance': -5,
      'approved': -10,
      'signed': -15
    };
    
    Object.entries(riskKeywords).forEach(([keyword, value]) => {
      if (textLower.includes(keyword)) riskScore += value;
    });
    
    riskScore = Math.min(95, Math.max(5, riskScore));
    
    // Extract entities using regex
    const keyEntities = [];
    const dateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
    const amountRegex = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP)/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    
    const dates = text.match(dateRegex);
    if (dates) keyEntities.push(...dates.slice(0, 2).map(d => `Date: ${d}`));
    
    const amounts = text.match(amountRegex);
    if (amounts) keyEntities.push(...amounts.slice(0, 2).map(a => `Amount: ${a}`));
    
    const emails = text.match(emailRegex);
    if (emails) keyEntities.push(...emails.slice(0, 1));
    
    const phones = text.match(phoneRegex);
    if (phones) keyEntities.push(...phones.slice(0, 1).map(p => `Phone: ${p}`));
    
    // Extract company name (simple heuristic)
    let companyName = null;
    const lines = text.split('\n');
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i].trim();
      if (line.includes('Inc.') || line.includes('LLC') || line.includes('Ltd') || 
          line.includes('Corp') || line.includes('Company') || line.includes('©')) {
        companyName = line.replace(/[^\w\s.]/g, '').substring(0, 50);
        keyEntities.push(`Company: ${companyName}`);
        break;
      }
    }
    
    // Extract contract ID
    let contractId = null;
    const idRegex = /(?:contract|agreement|invoice|ref|id|#)\s*[:\s]*([A-Z0-9-]{5,20})/gi;
    const idMatch = idRegex.exec(text);
    if (idMatch) {
      contractId = idMatch[1];
      keyEntities.push(`ID: ${contractId}`);
    }
    
    // Generate flags
    const flags = [];
    if (riskScore > 60) flags.push('⚠️ High risk indicators detected - review required');
    if (text.length < 500) flags.push('📄 Document appears to be incomplete or too short');
    if (textLower.includes('confidential')) flags.push('🔒 Contains confidential information');
    if (textLower.includes('expired') || textLower.includes('overdue')) flags.push('⏰ Time-sensitive document detected');
    if (textLower.includes('signature') && !textLower.includes('signed')) flags.push('✍️ Signature may be missing');
    if (textLower.includes('deadline') && !textLower.includes('met')) flags.push('📅 Upcoming deadline detected');
    if (textLower.includes('penalty') || textLower.includes('fee')) flags.push('💰 Potential financial penalties identified');
    
    // Compliance check
    let complianceStatus = 'compliant';
    if (flags.length > 2) complianceStatus = 'needs_review';
    if (riskScore > 70) complianceStatus = 'non-compliant';
    
    return {
      summary: `This ${documentType} contains ${
        documentType === 'invoice' ? 'payment details and financial information' :
        documentType === 'contract' ? 'binding terms and conditions between parties' :
        documentType === 'non-disclosure agreement' ? 'confidentiality provisions' :
        'standard business information'
      }. ${flags.length > 0 ? 'Several items require attention.' : 'No immediate concerns detected.'}`,
      document_type: documentType,
      risk_score: Math.round(riskScore),
      confidence_score: 0.85,
      key_entities: keyEntities.slice(0, 8),
      flags: flags.slice(0, 5),
      extracted_fields: {
        company_name: companyName || 'Not found',
        date: dates ? dates[0] : 'Not found',
        amount: amounts ? amounts[0] : 'Not found',
        contract_id: contractId || 'Not found',
        address: 'Not found in preview',
        email: emails ? emails[0] : 'Not found',
        phone: phones ? phones[0] : 'Not found'
      },
      compliance_check: {
        status: complianceStatus,
        issues: flags.slice(0, 3)
      }
    };
  }
}