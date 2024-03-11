import nodemailer from "nodemailer";
import { SMTP_CONFIG } from "./config/smtp.mjs";
import htmlTemplates from "./templates/template-escolas-mensalidades.mjs";
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
        <p><strong>${dados.id_cadeira ? 'Cadeira: '+ dados.cadeira : '' }</strong></p>
        <div style="position: relative;padding: 16px;background-color: #e6e6e6;color: #000;border: 1px dashed;">
        <div style="display:flex; justify-content: space-between;">
        <span> Mensalidade:</span><span><strong style="text-transform: uppercase;"> ${new Date(new Date().setMonth(new Date().getMonth()+1)).toLocaleDateString('pt-br', {month: ('long')})}</strong></span></div>
        <div style="display: flex;justify-content: space-between;">
        <span> Valor:</span><span><strong>${Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(String(dados.valor_compra_unitaria))}</strong></span></div>
        <div style="display: flex;justify-content: space-between;">
        <span> Data de Pagamento:</span><span><strong> ${new Date().toLocaleDateString('pt-br')}</strong></span></div>
        <div style="display: flex;justify-content: space-between;">
        <span> Forma de Pagamento:</span><span><strong> ${dados.forma_pagamento}</strong></span></div>
        <div style="display: flex;justify-content: space-between;">
        <span> Status:</span><span><strong> Pago</strong></span></div>
        </div>
        <div style="text-align:center;border: 1px dashed;"><img src="https://s3.amazonaws.com/escolas.verbocampogranderj.com.br/assets/imgs/credit-card-check.png"/></div>
      </div>
        `;
      qrint = qrcode + qrint;
      // console.log('qrint',qrint)
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
  }

  async function recuperarDados(codigo_referencia) {
    let collection = await db.collection("sys-eventos-inscritos");
    let query = { codigo_referencia: String(codigo_referencia) };
    let result = await collection.find(query).toArray();
    let id_evento = result.length > 0 ? result[0].id_evento : null;
    // let id_usuario = result.length > 0 ? result[0].id_usuario : null;
    let ingressos = {};

    // if (id_usuario != null) {
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
    // }
    return ingressos;
  }
}
