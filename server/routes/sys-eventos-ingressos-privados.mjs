import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();


//Consulta um Evento
router.get("/", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos-promocionais");
  let eventos = {};
    eventos = await collection
      .aggregate([
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
        {$project :
          {
            "_id":'_id',
            "titulo":'$JOIN.titulo',
            "nome":'$nome',
            "email":'$email',
            "telefone":'$telefone',
            "setor":'$setor',
            "observacao":'$JOIN.observacao',
            "online":'$JOIN.online',
            "tipo":'$JOIN.tipo',
            "data":'$data',
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
      },
      {
        $sort:{'nome':1, 'nome':1}
      }

      ])
      .toArray();

  let error = {};
  // console.log(eventos);
  if (!eventos) res.send(error).status(404);
  else res.send(eventos.length > 0 ? eventos : eventos).status(200);
});

//Recuperar Ingressos
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    let query = {email: String(req.body.email), ativo : true,};
    let result = await collection.find(query).sort({ ativo: -1 }).toArray();
    let error = {}
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);
  });


  router.post("/privado-ingresso", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    let query = { _id: ObjectId(req.body.id_promocional) };
    // console.log(req.body.id_ingresso);

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
              "tipo_ingresso_promocional":'$tipo',
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


  router.post("/privado-ingresso-adm", async (req, res) => {
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    let query = { _id: ObjectId(req.body.id_promocional) };
    // console.log(req.body.id_ingresso);

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
          {$project:
            {
              "_id":'_id',
              "titulo":'$JOIN.titulo',
              "nome":'$nome',
              "email":'$email',
              "telefone":'$telefone',
              "setor":'$setor',
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
              "ativo_promocional":'$ativo',
              "validado":'$validado',
              "data_validado":'$data_validado',
              "termino":'$JOIN.termino',
              "image":'$JOIN.image',
              "valor":'$valor',
              "discipulado":'$discipulado',
              "modal":'$modal',
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

router.post("/atualizar/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $set: {
      id_evento: req.body.id_evento, 
      id_ingresso: req.body.id_ingresso, 
      nome: req.body.nome, 
      email: req.body.email, 
      telefone: req.body.telefone, 
      valor: req.body.valor, 
      limite: req.body.limite,
      setor: req.body.setor,
      ativo: req.body.ativo,
      validado: req.body.validado,
      discipulado: req.body.discipulado,
      modal: req.body.modal
    }
  } 

  // console.log(query);
  // console.log(updates);

  let collection = await db.collection("sys-eventos-ingressos-promocionais");
  
  let result = await collection.updateOne(query, updates);
  const query2 = { _id: ObjectId(req.body.id_ingresso) };

  const update = {
    $set: {
      link_externo: {
        url: "privado",
        ativo: true,
        codigo:String(req.body.email).toLowerCase(),
        texto: req.body.modal
      }
    }
  } 
  // console.log(update);
  // return;

  let collection2 = await db.collection("sys-eventos-ingressos");
  let result2 = await collection2.updateOne(query2,update);

  res.send(result).status(200);
});


router.post("/incluir-ingresso-privado", async (req, res) => {
  const ingresso = req.body.ingresso
  const query = { _id: ObjectId(ingresso.id_ingresso) };

  const include = {
      id_evento: ingresso.id_evento, 
      id_ingresso: ingresso.id_ingresso, 
      nome: ingresso.nome, 
      email: String(ingresso.email).toLowerCase(), 
      telefone: ingresso.telefone, 
      valor: ingresso.valor, 
      limite: ingresso.limite,
      setor: ingresso.setor,
      ativo: ingresso.ativo,
      validado: ingresso.validado,
      discipulado: ingresso.discipulado,
      modal: ingresso.modal
  } 



  //Inserir ingresso privado
  
  let collection = await db.collection("sys-eventos-ingressos-promocionais");
  let result = await collection.insertOne(include);

  // Atualizar ingresso

  const update = {
    $set: {
      link_externo: {
        url: "privado",
        ativo: true,
        codigo:String(ingresso.email).toLowerCase(),
        texto: ingresso.modal
      }
    }
  } 
  // console.log(update);
  // return;

  let collection2 = await db.collection("sys-eventos-ingressos");
  let result2 = await collection2.updateOne(query,update);

  res.send(result2).status(200);
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
