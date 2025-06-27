import nodemailer from 'nodemailer';
import colors from '../config/colors.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.diva.com',
  port: 587,
  auth: {
    user: 'tu_usuario',
    pass: 'tu_contraseña',
  },
});

export const sendReservationEmail = async (to, subject, text, html = null) => {
  const htmlContent = html || `
    <div style="background:${colors.neutral.light};padding:32px 0;">
      <div style="max-width:480px;margin:0 auto;background:${colors.neutral.white};border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);padding:32px 24px;">
        <h2 style="color:${colors.primary.main};font-family:sans-serif;margin-top:0;">${subject}</h2>
        <div style="color:${colors.neutral.dark};font-size:1.1rem;font-family:sans-serif;">${text}</div>
        <div style="margin-top:32px;font-size:0.9rem;color:${colors.neutral.medium};font-family:sans-serif;">Hotel DIVA - Gestión Hotelera</div>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: 'hotel@diva.com', to, subject, text, html: htmlContent });
};
