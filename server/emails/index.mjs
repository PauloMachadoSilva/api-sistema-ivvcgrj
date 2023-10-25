import nodemailer from "nodemailer";
import { SMTP_CONFIG } from "./config/smtp.mjs";
import htmlTemplates from "./templates/templates.mjs";
import QRCode from "qrcode";
import db from "../db/conn.mjs";

var qrcodes;
var qrcode;
var qr;
var dadosBanco;
var dadosQR;
var val;

export default async function enviarEmail(codigo_referencia, dadosEmail) {
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

  // console.log('codigo_referencia>>>',codigo_referencia)
  // console.log('dadosInscricao>>>',dadosInscricao)

  // let img = await QRCode.toDataURL('data invoice untuk di kirim melalui email');
  //Realizar a consulta por codigo_referencia
 
  dadosBanco = await recuperarDados(codigo_referencia);
  dadosQR = await qrcodeGerate(dadosBanco);
  email(dadosEmail,dadosBanco,dadosQR);
  
  async function qrcodeGerate(data) {
    let ret = data
    let reat=''
    let sreat=''
      for (let val of ret) {
        reat = reat + await generateQrPromisse(val);
      }
    return reat
  }

  async function generateQrPromisse(dados) {
    let qrint=''
      qr = await QRCode.toDataURL(`${String(dados._id)}`);
      qrcode = `
      <div style='border-bottom:2px dotted #00549c;padding:16px'>
        <h2>${dados.INGRESSO[0].descricao}</h2>
        <p>${dados.INGRESSO[0].titulo}</p>
        <p>${dados._id}</p>
        <p>${dados.nome}</p>
        <img style='width:200px' src='${qr}'>
      </div>
        `;
      qrint = qrcode + qrint;
      return qrint
  }
  
  async function email(dadosEmail,dadosInscricao, qrcodes) {
    //  Caebeçalho do email
    const enviarEmail = await transporter.sendMail({
      from: SMTP_CONFIG.email, // Rementente
      to: dadosEmail.email, // Destinatario
      subject: dadosEmail.subject, // Assunto
      text: dadosEmail.texto, // Texto
      html: htmlTemplates(dadosInscricao, qrcodes), // html/template
      attachDataUrls: true,
    });
    console.log('Email>', enviarEmail);
  }

  async function recuperarDados(codigo_referencia) {
    let collection = await db.collection("sys-eventos-inscritos");
    let query = { codigo_referencia: String(codigo_referencia) };
    let result = await collection.find(query).toArray();
    let id_evento = result.length > 0 ? result[0].id_evento : null;
    // let id_usuario = result.length > 0 ? result[0].id_usuario : null;
    let ingressos = {};

    if (id_usuario != null) {
      ingressos = await collection
        .aggregate([
          // { $match: { id_usuario: id_usuario } },
          { $match: { codigo_referencia: codigo_referencia } },
          // { $addFields: { id: { $toObjectId: id_usuario } } },
          { $addFields: { id2: { $toObjectId: "$id_ingresso" } } },
          // {
          //   $lookup: {
          //     from: "usuarios",
          //     localField: "id",
          //     foreignField: "_id",
          //     as: "USUARIO",
          //   },
          // },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },
        ])
        .toArray();
    }
    return ingressos;
  }
}
