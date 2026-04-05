export function createAIPrompt(text) {
  return `Analyze the following document and return a JSON response with this exact structure:

{
  "summary": "A concise 2-3 sentence summary of the document",
  "document_type": "The type of document (invoice, contract, report, letter, agreement, etc.)",
  "risk_score": "A number from 0-100 indicating risk level (0 = no risk, 100 = high risk)",
  "confidence_score": "A number from 0-1 indicating confidence in analysis",
  "key_entities": ["List of important entities found such as company names, person names, dates, amounts, etc."],
  "flags": ["List of potential issues, red flags, or missing items found in the document"],
  "extracted_fields": {
    "company_name": "Extracted company name if found",
    "date": "Extracted date if found",
    "amount": "Extracted monetary amount if found",
    "address": "Extracted address if found"
  },
  "compliance_check": {
    "is_compliant": true/false,
    "missing_requirements": ["List of missing compliance requirements"]
  }
}

Document text:
${text.substring(0, 4000)}`;
}