import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();

//Consulta Evento por ID
router.get("/:id_evento", async (req, res) => {
  let id_evento = String(req.params.id_evento);
  let query = { _id: id_evento};
  let collection = await db.collection("sys-escolas-materiais-aula");
  let results = await collection.find(query).sort().toArray();
  res.send(results).status(200);
});

//Consulta Evento por ID
router.get("/", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-escolas-materiais-aula");
    let results = await collection.find().sort({titulo : 1}).toArray();
    res.send(results).status(200);
  });


//Alterar Evento POST
router.post("/atualizar-evento/:id", async (req, res) => {
  let collection = await db.collection("sys-escolas");
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $set: {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        data_inicial: new Date(req.body.data_inicial),
        data_final:  new Date(req.body.data_final),
        local: req.body.local,
        local_obs: req.body.local_obs,
        tipos_pagamento: req.body.tipos_pagamento,
        image: req.body.image,
        ativo: req.body.ativo,
        responsaveis: req.body.responsaveis,
        cadeiras_numeradas: req.body.cadeiras_numeradas,
        classificacao_etaria: {
          idade: req.body.classificacao_etaria,
          observacao: ''
        },
        limite: req.body.limite,
        sigla: req.body.sigla,
        modal: req.body.modal,
        exibir_home: req.body.exibir_home,
        modal_texto: req.body.modal_texto,
        termino: req.body.termino,
        duracao: req.body.duracao
    }
  }
  // console.log('query', query)
  // console.log('updates', updates)
  // return;
  let result = await collection.updateOne(query, updates);
  let error = {};
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

export default router;
