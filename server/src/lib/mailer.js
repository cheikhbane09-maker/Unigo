import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!env.mail.enabled) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });
  return transporter;
}

/**
 * Envoie un e-mail. En developpement (MAIL_ENABLED=false), le contenu est
 * simplement affiche dans la console du serveur : pratique pour recuperer
 * le lien de reinitialisation sans configurer de compte SMTP.
 */
export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    console.log('\n──────────── E-MAIL (mode developpement) ────────────');
    console.log('A       :', to);
    console.log('Sujet   :', subject);
    console.log('Contenu :', text || html);
    console.log('─────────────────────────────────────────────────────\n');
    return { mocked: true };
  }
  return tx.sendMail({ from: env.mail.from, to, subject, html, text });
}

export function resetPasswordEmail({ fullName, link, ttlMinutes }) {
  const text = `Bonjour ${fullName},

Vous avez demande la reinitialisation de votre mot de passe UNIGO.
Cliquez sur ce lien (valable ${ttlMinutes} minutes) : ${link}

Si vous n'etes pas a l'origine de cette demande, ignorez cet e-mail.

L'equipe UNIGO`;

  const html = `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#0f766e">UNIGO</h2>
    <p>Bonjour <strong>${fullName}</strong>,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <p style="margin:28px 0">
      <a href="${link}" style="background:#0f766e;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">
        Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="color:#64748b;font-size:13px">Ce lien est valable ${ttlMinutes} minutes et ne peut être utilisé qu'une seule fois.</p>
    <p style="color:#64748b;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
  </div>`;

  return { subject: 'UNIGO — Réinitialisation de votre mot de passe', text, html };
}
