import { v4 as uuidv4 } from 'uuid';
import { extractText } from './utils/textExtractor';
import { Analysis } from './analysis';

export class Documents {
  constructor(env, user) {
    this.env = env;
    this.user = user;
    this.db = env.DB;
    this.r2 = env.DOCUMENTS;
  }

  async getAll(request) {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM documents WHERE user_id = ?';
    const params = [this.user.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const documents = await this.db.prepare(query).bind(...params).all();

    // Get total count
    const total = await this.db.prepare(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = ?'
    ).bind(this.user.userId).first();

    return new Response(JSON.stringify({
      documents: documents.results,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getById(id) {
    const document = await this.db.prepare(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?'
    ).bind(id, this.user.userId).first();

    if (!document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get analysis if exists
    const analysis = await this.db.prepare(
      'SELECT * FROM analysis WHERE document_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(id).first();

    return new Response(JSON.stringify({
      ...document,
      analysis
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async upload(request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const documentId = uuidv4();
    const fileName = `${documentId}-${file.name}`;
    const fileKey = `documents/${this.user.userId}/${fileName}`;

    // Upload to R2
    await this.r2.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`
      }
    });

    // Create document record
    const fileUrl = `${this.env.R2_PUBLIC_URL}/${fileKey}`;
    await this.db.prepare(
      `INSERT INTO documents (id, user_id, file_name, file_url, file_type, status) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(documentId, this.user.userId, file.name, fileUrl, file.type, 'pending').run();

    // Log activity
    await this.db.prepare(
      `INSERT INTO activity_logs (id, user_id, action, document_id, details) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(uuidv4(), this.user.userId, 'upload', documentId, `Uploaded ${file.name}`).run();

    // Trigger analysis in background
    const analysis = new Analysis(this.env, this.user);
    await analysis.processDocument(documentId, file);

    return new Response(JSON.stringify({
      id: documentId,
      message: 'Document uploaded successfully',
      status: 'pending'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}