import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();


//Consulta um Evento
router.get("/", async (req, res) => {
    let collection = await db.collection("sys-eventos");
    let results = await collection.find({})
      .toArray();
    res.send(results).status(200);
});

//Recuperar Ingressos
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos");
    // console.log(req);
    let query = {id_evento: String(req.body.id_evento), ativo : true, online : true};
    let result = await collection.find(query).sort({ tipo:1, valor : 1, data: 1 }).toArray();
    let error = {}
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);
  });

  //Recuperar Ingressos
router.post("/presencial", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");
  // console.log(req);
  let query = {id_evento: String(req.body.id_evento), ativo : true};
  let result = await collection.find(query).sort({ tipo:1, valor : 1, data: 1 }).toArray();
  let error = {}
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});


export default router;
