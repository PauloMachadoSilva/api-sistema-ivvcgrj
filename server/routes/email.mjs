import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import email from '../emails/index.mjs'
import enviarEmailCompra from "../emails/index.mjs";
import enviarEmailInscricao from "../emails/email-inscricao.mjs";

const router = express.Router();

function isLocalRequest(req) {
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1'
        || ip === '::1'
        || ip === '::ffff:127.0.0.1'
        || ip.includes('127.0.0.1');
}

router.post("/", async (req, res) => {
    let newDocument = req.body;
    console.log(newDocument);
    let send = email(newDocument);
    if (!send) res.send(error).status(404);
    else res.send(send).status(200);
  });

router.post("/teste-confirmacao", async (req, res) => {
    if (!isLocalRequest(req)) {
        res.status(403).send({ message: "Rota disponível apenas localmente." });
        return;
    }

    const inscricoes = req.body.inscricao ? req.body.inscricao : [];
    const dadosUsuario = req.body.usuario ? req.body.usuario : {};
    const tipo = req.body.tipo ? req.body.tipo : 'compra';

    if (!Array.isArray(inscricoes) || inscricoes.length === 0) {
        res.status(400).send({ message: "Informe inscricao com pelo menos um item." });
        return;
    }

    const codigoReferencia = inscricoes[0].codigo_referencia;
    const emailDestino = req.body.email ? req.body.email : dadosUsuario.email;

    if (!codigoReferencia || !emailDestino) {
        res.status(400).send({ message: "Informe codigo_referencia na inscricao e email/usuario.email." });
        return;
    }

    const collection = await db.collection("sys-eventos-inscritos");
    for (const inscricao of inscricoes) {
        inscricao.status_compra = '3';
        inscricao.data_compra = inscricao.data_compra ? new Date(inscricao.data_compra) : new Date();
        await collection.insertOne(inscricao);
    }

    const dadosEmail = {
        email: emailDestino,
        subject: tipo === 'inscricao' ? 'Inscrição realizada!' : 'Compra aprovada!',
        texto: 'Ingressos'
    };

    if (tipo === 'inscricao') {
        await enviarEmailInscricao(codigoReferencia, dadosEmail);
    } else {
        await enviarEmailCompra(codigoReferencia, dadosEmail);
    }

    res.status(200).send({
        message: "Email de teste enviado.",
        codigo_referencia: codigoReferencia,
        email: emailDestino,
        total_inscricoes: inscricoes.length
    });
  });
  



export default router;
