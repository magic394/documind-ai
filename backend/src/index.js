import { Auth } from './auth';
import { Documents } from './documents';
import { Analysis } from './analysis';
import { authenticate } from './middleware';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Helper function to create responses with CORS headers
    const createResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    try {
      // Public routes
      if (path === '/api/login' && method === 'POST') {
        const auth = new Auth(env);
        const response = await auth.login(request);
        // Add CORS headers to the response
        const data = await response.json();
        return createResponse(data, response.status);
      }

      if (path === '/api/register' && method === 'POST') {
        const auth = new Auth(env);
        const response = await auth.register(request);
        // Add CORS headers to the response
        const data = await response.json();
        return createResponse(data, response.status);
      }

      // Protected routes
      const user = await authenticate(request, env);
      if (!user) {
        return createResponse({ error: 'Unauthorized' }, 401);
      }

      // Document routes
      const documents = new Documents(env, user);

      if (path === '/api/documents' && method === 'GET') {
        const response = await documents.getAll(request);
        const data = await response.json();
        return createResponse(data, response.status);
      }

      if (path === '/api/upload-document' && method === 'POST') {
        const response = await documents.upload(request);
        const data = await response.json();
        return createResponse(data, response.status);
      }

      if (path.match(/^\/api\/document\/[\w-]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        const response = await documents.getById(id);
        const data = await response.json();
        return createResponse(data, response.status);
      }

      if (path === '/api/analyze-document' && method === 'POST') {
        const analysis = new Analysis(env, user);
        const response = await analysis.analyze(request);
        const data = await response.json();
        return createResponse(data, response.status);
      }

      // Not found
      return createResponse({ error: 'Not found' }, 404);

    } catch (error) {
      console.error('Worker error:', error);
      return createResponse({ error: error.message || 'Internal server error' }, 500);
    }
  }
};