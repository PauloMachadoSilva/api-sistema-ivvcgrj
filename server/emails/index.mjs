
import nodemailer from 'nodemailer';
import {SMTP_CONFIG} from "./config/smtp.mjs";
import htmlTemplates from "./templates/templates.mjs";
  
export default async function enviarEmail (emailUsario) {

const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure, // true for 465, false for other ports
    auth: {
      user: SMTP_CONFIG.user, // generated ethereal user
      pass: SMTP_CONFIG.pass, // generated ethereal password
    },
    tls : {
        rejectUnauthorized: false
    }
  });
  //  Caebeçalho do email
  const enviarEmail = await transporter.sendMail({
    from: SMTP_CONFIG.email, // Rementente
    to: emailUsario.email, // Destinatario
    subject: emailUsario.subject, // Assunto
    text: emailUsario.texto, // Texto
    html: htmlTemplates(emailUsario), // html/template
  });
  console.log(enviarEmail);
};  