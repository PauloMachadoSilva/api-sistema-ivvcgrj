import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();

//Consulta um Evento
router.get("/", async (req, res) => {
  let collection = await db.collection("sys-eventos");
  let results = await collection.find({}).sort({'ativo':-1, 'data_inicial':-1}).toArray();
  res.send(results).status(200);
});

//Recuperar Evento POST
router.post("/", async (req, res) => {
  let collection = await db.collection("sys-eventos");
  // console.log(req);
  let query = { _id: ObjectId(req.body._id) };
  let result = await collection.findOne(query);
  let error = {};
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

//Consulta um Evento do cliente
router.get("/meus-eventos", async (req, res) => {
  let collection = await db.collection("sys-eventos");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});


//Inserir Evento POST
router.post("/incluir-evento", async (req, res) => {
  let collection = await db.collection("sys-eventos");
  // console.log(req.body);
  // return;
  let query = req.body;
  query.classificacao_etaria = {
    idade: req.body.classificacao_etaria,
    observacao: ''
  }
  query.data_inicial = new Date(query.data_inicial);
  query.data_final = new Date(query.data_final);
  query.limite = Number(query.limite);
  // console.log(query);
  // return;
  let result = await collection.insertOne(query);
  let error = {};
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

export default router;
