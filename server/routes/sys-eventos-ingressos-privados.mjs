import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();


//Consulta um Evento
router.get("/", async (req, res) => {
    console.log('privados')
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    let results = await collection.find({}).sort({'ativo':-1})
      .toArray();
    res.send(results).status(200);
});

//Recuperar Ingressos
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    // console.log(req);
    let query = {email: String(req.body.email), ativo : true,};
    console.log(query);
    let result = await collection.find(query).sort({ ativo: -1 }).toArray();
    let error = {}
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);
  });


  router.post("/privado-ingresso", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    let query = { _id: ObjectId(req.body.id_promocional) };
    console.log(req.body.id_ingresso);

    let eventos = {};
      eventos = await collection
        .aggregate([
          { $match : query },
          { $addFields: { id: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id",
              foreignField: "_id",
              as: "JOIN",
            },
          },
          {
            "$unwind": "$JOIN"
          },
          {$group : {_id:
            {
              "titulo":'$JOIN.titulo',
              "observacao":'$JOIN.observacao',
              "online":'$JOIN.online',
              "tipo":'$JOIN.tipo',
              "data":'$JOIN.data',
              "limite":'$JOIN.limite',
              "limite_promocional":'$limite',
              "id_evento":{ "$toObjectId": "$id_evento" },
              "_id":{ "$toObjectId": "$_id" },
              "id_ingresso":{ "$toObjectId": "$JOIN._id" },
              "descricao":'$JOIN.descricao',
              "data_inicial":'$JOIN.data_inicial',
              "data_final":'$JOIN.data_final',
              "local":'$JOIN.local',
              "local_obs":'$JOIN.local_obs',
              "sigla":'$JOIN.sigla',
              "duracao":'$JOIN.duracao',
              "ativo":'$JOIN.ativo',
              "termino":'$JOIN.termino',
              "image":'$JOIN.image',
              "valor":'$valor',
            }
          }
        },

        ])
        .toArray();

    let error = {};
    // console.log(eventos);
    if (!eventos) res.send(error).status(404);
    else res.send(eventos.length > 0 ? eventos : eventos).status(200);
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
          $sort:{'ativo':-1, 'data':-1 }
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


export default router;
