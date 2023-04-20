import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();

//Consultar todos os visistantes
router.get("/", async (req, res) => {
  let collection = await db.collection("visitantes");
  let results = await collection
    .find({})
    // .limit(50)
    .toArray();

  res.send(results).status(200);
});

//Adicionar um visitante
router.post("/", async (req, res) => {
  let collection = await db.collection("visitantes");
  let newDocument = req.body;
  let result = await collection.insertOne(newDocument);
  res.send(result).status(200);

  //logs
  let log = req.body;
  log.acao = "cadastro-visitante";
  log.nome_collection = "visitantes";
  log.id_collection = result.insertedId;
  log.metodo = "post";
  log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  newDocument.date = new Date();
  let log_result = await logsFunction(log);
});

//Alterar um visitante
router.post("/alterar-visitante/:_id", async (req, res) => {
  const query = { _id: ObjectId(req.params._id) };
  const updates = {
    $set: {
      nome: req.body.nome,
      telefone: req.body.telefone,
      data: req.body.data,
      convidado_por: req.body.convidado_por,
      como_conheceu: req.body.como_conheceu,
      usuario: req.body.usuario,
    },
  };

  let collection = await db.collection("visitantes");
  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);

  //logs
  let log = req.body;
  log.acao = "atualizar-visitante";
  log.nome_collection = "visitantes";
  log.id_collection = log._id;
  log.metodo = "post";
  log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  let log_result = await logsFunction(log);
  // console.log(log_result);
});

export default router;
