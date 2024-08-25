
import express from "express";
import db from "../db/conn.mjs";
import { Int32, ObjectId } from "mongodb";


const router = express.Router();

router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-cadeiras-layout");
    let newDocument = req.body;
    newDocument.date = tratarData();
    newDocument.resolvido = null;
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  });


  router.post("/vendidas", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    let body = req.body;
    let query = { id_cadeira: body.id_cadeira, id_evento: body.id_evento, status_compra: '3'};
    let result = await collection.findOne(query);
    let error = {}
    result = result ? true : false;
    res.send(result).status(200);
  });

router.get("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-cadeiras-layout");
    let results = await collection.find({}).sort({linha: 1})
    // let results = await collection.find({})
      // .limit(50)
      .toArray();
  
    res.send(results).status(200);
  });

  router.get("/:id", async (req, res) => {
    let collection = await db.collection("sys-eventos-cadeiras-layout");
    let query = { _id: ObjectId(req.params.id) };
    let result = await collection.findOne(query);
    let error = {}
  
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);
  });
  

  function tratarData() {
    let dataAjustada = new Date();
    let h = dataAjustada.getHours() -3;
    dataAjustada.setHours(h);
    return dataAjustada
  }

  router.get("/vendidas/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-cadeiras-layout");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $match : { ativo : 'true',} },
          { $addFields: { id2: { "$toString": "$_id" } } },
          {
            $lookup: {
              from: "sys-eventos-inscritos",
              let: {
                id_evento: id_evento
              },
              pipeline: [
                { $match: {
                    $expr: { $and: [
                        { $eq: [ "$id_evento", "$$id_evento" ] },
                        { $eq: [ "$status_compra", "3" ] },
                    ] }
                } }
              ],
              localField: "id2",
              foreignField: "id_cadeira",
              as: "VENDIDO",
            },
          },
          {
            $sort:{'linha':1, 'posicao':1}
          }
        ])
        // .find({}).sort({linha: 1, posicao:1})
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });
export default router;