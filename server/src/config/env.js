import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Copiez server/.env.example en server/.env.`
    );
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL', 'mysql://root:@localhost:3306/unigo'),
  jwtSecret: required('JWT_SECRET', 'unigo-dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  resetTokenTtlMinutes: Number(process.env.RESET_TOKEN_TTL_MINUTES || 30),
  mail: {
    enabled: String(process.env.MAIL_ENABLED).toLowerCase() === 'true',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'UNIGO <no-reply@unigo.sn>',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@unigo.sn',
    password: process.env.ADMIN_PASSWORD || 'Admin1234!',
  },
};

export const isProd = env.nodeEnv === 'production';
