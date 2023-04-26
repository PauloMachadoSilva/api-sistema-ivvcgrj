import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();


//Consulta um Evento
router.get("/", async (req, res) => {
    let collection = await db.collection("eventos");
    let results = await collection.find({})
      .toArray();
    res.send(results).status(200);
});

//Adicionar um evento
router.post("/", async (req, res) => {
  let collection = await db.collection("eventos");
  let newDocument = req.body;
  // console.log(newDocument);
  let result = await collection.insertOne(newDocument);
  res.send(result).status(200);

  //logs
  let log = req.body;
  log.acao = "cadastro-eventos";
  log.nome_collection = "eventos";
  log.id_collection = result.insertedId;
  log.metodo = "post";
  log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  newDocument.date = new Date();
  let log_result = await logsFunction(log);
});

router.post("/alterar-evento/:_id", async (req, res) => {
  const query = { _id: ObjectId(req.params._id) };
  // console.log(query);
  const updates = {
    $set: {
      descricao: req.body.descricao,
      local: req.body.local,
      hora: req.body.hora,
      observacao: req.body.observacao,
      tipo: req.body.tipo,
      confirmado: req.body.confirmado,
    },
  };

  let collection = await db.collection("eventos");
  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);

  //logs
  let log = req.body;
  log.acao = "atualizar-eventos";
  log.nome_collection = "eventos";
  log.id_collection = log._id;
  log.metodo = "post";
  log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  let log_result = await logsFunction(log);
  // console.log(log_result);
});


export default router;
