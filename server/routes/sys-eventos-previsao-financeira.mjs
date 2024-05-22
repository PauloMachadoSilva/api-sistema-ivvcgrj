
import express from "express";
import db from "../db/conn.mjs";
import enviarEmailFormularioDuvidas from "../emails/email-formulario-duvidas.mjs";
import logsFunctionAdm from "../logs/logs-functions-adm.mjs";

import { Int32, ObjectId } from "mongodb";


const router = express.Router();

// Adicionando usuários
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-financeiro-lancamentos");
    let newDocument = req.body;
    newDocument.date = tratarData();
    newDocument.resolvido = null;
    // console.log('newDocument',newDocument)
    // return;
    let dadosEmail = {
      email: 'nucleo.operacionalcg@gmail.com',
      subject: 'Formulário de dúvidas - Escola IVVCGRJ',
      texto: 'Formulário de dúvidas - Escola IVVCGRJ'

    }
    let result = await collection.insertOne(newDocument);
    enviarEmailFormularioDuvidas(
      newDocument,
      dadosEmail
    );
    res.send(result).status(204);
  });


  router.post("/responder/:id", async (req, res) => {
    const query = { _id: ObjectId(req.params.id) };
    let body = req.body;
    // console.log(query);
    // console.log(body);
    const updates = {
      $set: { 
        resolvido: tratarData()
      }
    }
  
    // console.log(query);
    // console.log(updates);
  
    let collection = await db.collection("sys-eventos-formulario-duvidas");
    let result = await collection.updateOne(query, updates);
  
    res.send(result).status(200);
  });

  //Consultar previsao financeira por evento e tipo
router.get("/previsto/:id_evento/:tipo_despesa", async (req, res) => {
    let collection = await db.collection("sys-eventos-financeiro-lancamentos");
    let id_evento = String(req.params.id_evento);
    let tipo_despesa = String(req.params.tipo_despesa);
    // console.log(tipo_despesa);
    // return;
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_evento" } } },
          {
            $lookup: {
              from: "sys-eventos",
              localField: "id2",
              foreignField: "_id",
              as: "EVENTO",
            },
          },  
          { $match : { id_evento : id_evento }},   
          {
            "$unwind": "$EVENTO"
          },  
          { $match : { tipo : 'P', tipo_despesa: tipo_despesa }},  
          
          {$project:
            {
              "categoria":'$categoria',
              "descricao":'$descricao',
              "quantidade":'$quantidade',
              "valor_unitario":'$valor_unitario',
              "valor_total":'$valor_total',
              "tipo":'$tipo',
              "data":'$data',
            },
            // valor_unitario:{$sum:"$valor_unitario"}
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });


  router.get("/categorias", async (req, res) => {
    let collection = await db.collection("sys-eventos-financeiro-categorias");
    // let query = { _id: ObjectId(req.params.id) };
    let result = await collection.find().sort({tipo: 1}).toArray();
    console.log('aqui');
    res.send(result).status(200);
  });

  router.post("/incluir-previsao", async (req, res) => {
    let collection = await db.collection("sys-eventos-financeiro-lancamentos");
    // console.log(req.body);
    // return;
    let query = req.body;
    query.data = tratarData();
    query.tipo_sistema = 'sys-eventos';
    // console.log(query);
    // return;
    let result = await collection.insertOne(query);
    let log = req.body;
    log.acao = "cadastrar-previsao";
    log.nome_collection = "sys-eventos-financeiro-lancamentos";
    log.id_collection = result.insertedId;
    log.metodo = "post";
    log.campos = req.body.ingresso
    log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
    log.data = new Date();
    logs(log);
    // return;
    let error = {};
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);
  });

  function tratarData() {
    let dataAjustada = new Date();
    let h = dataAjustada.getHours() -3;
    dataAjustada.setHours(h);
    return dataAjustada
  }

  async function logs(log) {
    let log_result = await logsFunctionAdm(log);
  }
  

export default router;