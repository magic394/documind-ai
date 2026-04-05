import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from '@tsndr/cloudflare-worker-jwt';

export class Auth {
  constructor(env) {
    this.env = env;
    this.db = env.DB;
  }

  async register(request) {
    try {
      console.log('Register endpoint called');
      const { email, password } = await request.json();
      console.log('Registration attempt for:', email);

      // Validate input
      if (!email || !password) {
        console.log('Missing email or password');
        return new Response(JSON.stringify({ error: 'Email and password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if user exists
      console.log('Checking if user exists...');
      const existingUser = await this.db.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first();

      if (existingUser) {
        console.log('User already exists:', email);
        return new Response(JSON.stringify({ error: 'User already exists' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Hash password
      console.log('Hashing password...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const userId = uuidv4();
      console.log('Creating user with ID:', userId);
      
      const insertResult = await this.db.prepare(
        'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
      ).bind(userId, email, passwordHash).run();
      
      console.log('Insert result:', insertResult);

      // Create token
      console.log('Creating JWT token...');
      const token = await jwt.sign(
        { userId, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
        this.env.JWT_SECRET
      );

      console.log('Registration successful for:', email);
      return new Response(JSON.stringify({ token, user: { id: userId, email } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Registration error details:', error);
      return new Response(JSON.stringify({ error: error.message || 'Registration failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async login(request) {
    try {
      console.log('Login endpoint called');
      const { email, password } = await request.json();
      console.log('Login attempt for:', email);

      // Get user
      const user = await this.db.prepare(
        'SELECT id, email, password_hash FROM users WHERE email = ?'
      ).bind(email).first();

      if (!user) {
        console.log('User not found:', email);
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verify password
      console.log('Verifying password...');
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log('Invalid password for:', email);
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create token
      console.log('Creating JWT token...');
      const token = await jwt.sign(
        { userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
        this.env.JWT_SECRET
      );

      console.log('Login successful for:', email);
      return new Response(JSON.stringify({ 
        token, 
        user: { id: user.id, email: user.email } 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Login error details:', error);
      return new Response(JSON.stringify({ error: error.message || 'Login failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}