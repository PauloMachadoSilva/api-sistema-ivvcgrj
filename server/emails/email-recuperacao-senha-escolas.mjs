import nodemailer from "nodemailer";
import { SMTP_CONFIG } from "./config/smtp.mjs";
import htmlTemplatesRecuperarSenhaEscolas from "./templates/template-recuperar-senha-escolas.mjs";

var qrcodes;
var qrcode;
var qr;
var dadosBanco;
var dadosQR;
var val;

export default async function enviarEmailRecuperacaoSenhaEscolas(dadosUsuario, dadosEmail) {
  const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure, // true for 465, false for other ports
    auth: {
      user: SMTP_CONFIG.user, // generated ethereal user
      pass: SMTP_CONFIG.pass, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

    //  Caebeçalho do email
    const enviarEmail = await transporter.sendMail({
      from: SMTP_CONFIG.email, // Rementente
      to: dadosEmail.email, // Destinatario
      subject: dadosEmail.subject, // Assunto
      text: dadosEmail.texto, // Texto
      html: htmlTemplatesRecuperarSenhaEscolas(dadosUsuario,dadosEmail), // html/template
      attachDataUrls: true,
    });
    
    // console.log(enviarEmail);
  
}
