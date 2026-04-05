import jwt from '@tsndr/cloudflare-worker-jwt';

export async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const isValid = await jwt.verify(token, env.JWT_SECRET);
    if (!isValid) return null;

    const { payload } = jwt.decode(token);
    if (!payload || !payload.userId) return null;
    return payload;
  } catch (error) {
    return null;
  }
}
