// services/emailService.js
import nodemailer from 'nodemailer';

// Configuración del transporte (usar Mailtrap para pruebas, SMTP real en prod)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'MAILTRAP_USER',
    pass: process.env.SMTP_PASS || 'MAILTRAP_PASS',
  },
});

export const sendReservationConfirmation = async ({ to, name, reservation }) => {
  const html = `
    <h2>¡Reserva confirmada!</h2>
    <p>Hola <b>${name}</b>, tu reserva ha sido confirmada.</p>
    <ul>
      <li><b>Habitación:</b> ${reservation.roomNumber}</li>
      <li><b>Check-in:</b> ${reservation.checkIn}</li>
      <li><b>Check-out:</b> ${reservation.checkOut}</li>
      <li><b>Huéspedes:</b> ${reservation.guests}</li>
    </ul>
    <p>Gracias por elegirnos.</p>
  `;
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'hotel@pms.com',
    to,
    subject: 'Confirmación de reserva',
    html,
  });
};

export default transporter;
