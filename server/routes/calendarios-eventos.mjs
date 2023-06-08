import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// Consultar calendario x eventos
router.get("/", async (req, res) => {

  let collection = await db.collection("calendarios-eventos");
  let results = await collection.aggregate([
    { "$addFields": { "id": { "$toObjectId": "$id_evento" }}},
    {
      $lookup: {
        from: 'eventos',
        localField: 'id',
        foreignField:'_id',
        as: 'JOIN'
      }
    }
  ])
    .toArray();

  res.send(results).status(200);
});

//Adicionar um Evento
router.post("/", async (req, res) => {
  let collection = await db.collection("calendarios-eventos");
  let newDocument = req.body;
  // console.log('newDocument',newDocument);
  newDocument.id_evento === '1'? newDocument.id_evento = '64807ce2faa90aa91e5a1fbc' : newDocument.id_evento = newDocument.id_evento;
  
  let result = await collection.insertOne(newDocument);
  res.send(result).status(200);

  //logs
  // let log = req.body;
  // log.acao = "cadastro-eventos";
  // log.nome_collection = "calendarios-eventos";
  // log.id_collection = result.insertedId;
  // log.metodo = "post";
  // log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  // newDocument.date = new Date();
  // let log_result = await logsFunction(log);
});

// Não Implementado
router.delete("/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  //console.log(query);
  const collection = db.collection("calendarios-eventos");
  let result = await collection.deleteOne(query);
  res.send(result).status(200);
});


export default router;
