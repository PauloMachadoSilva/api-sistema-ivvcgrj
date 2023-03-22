
import nodemailer from 'nodemailer';
import {SMTP_CONFIG} from "./config/smtp.mjs";

  
export default async function enviarEmail (emailUser) {

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
  //  send mail with defined transport object
  const enviarEmail = await transporter.sendMail({
    from: SMTP_CONFIG.email, // sender address
    to: emailUser.email, // list of receivers
    subject: emailUser.subject, // Subject line
    text: emailUser.texto, // plain text body
    html: "<b>Hello world?</b>", // html body
  });
  
  console.log(enviarEmail);

};  