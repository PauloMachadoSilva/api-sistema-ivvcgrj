import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();


//Consulta um Evento
router.get("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos");
    let results = await collection.find({}).sort({'ativo':-1, 'titulo':1})
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
router.post("/todos", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");
  // console.log(req);
  let query = {id_evento: String(req.body.id_ingresso), ativo : true, online : true};
  let result = await collection.find(query).sort({ tipo:1, valor : 1, data: 1 }).toArray();
  let error = {}
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

router.post("/todos-adm", async (req, res) => {
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

router.get("/ingressos-eventos", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");  
  let ingressos = {};
    ingressos = await collection
      .aggregate([
        { $addFields: { id: { "$toObjectId": "$id_evento" } } },
        {
          $lookup: {
            from: "sys-eventos",
            localField: "id",
            foreignField: "_id",
            as: "EVENTO",
          },
        },
        {
          $sort:{'ativo':-1, 'data':-1, 'EVENTO.titulo':1, }
        }
      ])
      .toArray();
  let error = {};
//   ingressos = {usuarios};
//   console.log(ingressos);
  if (!ingressos) res.send(error).status(404);
  else res.send(ingressos).status(200);
});

// router.post("/ingressos-eventos", async (req, res) => {
//   let collection = await db.collection("sys-eventos-ingressos");  
//   let ingressos = {};
//   let valid = ObjectId.isValid(req.body.id)
//   let id = valid ? ObjectId(String(req.body.id)) : null ;
  
//   if (id != null) {   
//     ingressos = await collection
//       .aggregate([
//         { $match : { _id : id } },
//         { $addFields: { id: { "$toObjectId": "$id_evento" } } },
//         {
//           $lookup: {
//             from: "sys-eventos",
//             localField: "id",
//             foreignField: "_id",
//             as: "EVENTO",
//           },
//         },
//       ])
//       .toArray();
//   }
//   let error = {};
// //   ingressos = {usuarios};
// //   console.log(ingressos);
//   if (!ingressos) res.send(error).status(404);
//   else res.send(ingressos).status(200);
// });


//Inserir Evento POST
router.post("/incluir-ingressos", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");
  // console.log(req.body);
  // return;
  let query = req.body;
  query.data = new Date(query.data);
  query.limite = Number(query.limite);
  query.tipo_sistema = 'sys-eventos';
  // console.log(query);
  // return;
  let result = await collection.insertOne(query);
  let error = {};
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});



export default router;
