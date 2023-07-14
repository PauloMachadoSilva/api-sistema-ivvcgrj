import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();

//Recuperar Ingressos por Usuário
router.post("/", async (req, res) => {
  let collection = await db.collection("sys-eventos-inscritos");
  // console.log(req);
  let query = { id_usuario: String(req.body.id_usuario) };
  let result = await collection.find(query).toArray();
  let id_usuario = String(req.body.id_usuario);
  let ingressos = {};
  let usuarios = {};
  // console.log(result.length > 0);

  if (id_usuario != null) {
    ingressos = await collection
      .aggregate([
        { $match : { id_usuario : id_usuario } },
        { $addFields: { id: { $toObjectId: id_usuario } } },
        { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
        {
          $lookup: {
            from: "usuarios",
            localField: "id",
            foreignField: "_id",
            as: "USUARIO",
          },
        },
        {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },
      ])
      .toArray();
  }
  let error = {};
//   ingressos = {usuarios};
//   console.log(ingressos);
  if (!ingressos) res.send(error).status(404);
  else res.send(ingressos).status(200);
});


//Recuperar Ingressos por ID
router.post("/inscricao", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");  
    let ingressos = {};
    let valid = ObjectId.isValid(req.body.id)
    let id = valid ? ObjectId(String(req.body.id)) : null ;
    
    if (id != null) {   
      ingressos = await collection
        .aggregate([
          { $match : { _id : id } },
          { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "usuarios",
              localField: "id",
              foreignField: "_id",
              as: "USUARIO",
            },
          },
          {
              $lookup: {
                from: "sys-eventos-ingressos",
                localField: "id2",
                foreignField: "_id",
                as: "INGRESSO",
              },
            },
        ])
        .toArray();
    }
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

//Recuperar todos os Ingressos
router.get("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([
          { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "usuarios",
              localField: "id",
              foreignField: "_id",
              as: "USUARIO",
            },
          },
          {
              $lookup: {
                from: "sys-eventos-ingressos",
                localField: "id2",
                foreignField: "_id",
                as: "INGRESSO",
              },
            }            
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3' }},       
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao'}, valor_compra_unitaria:{$sum:"$valor_compra_unitaria"}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-quantidade", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3' }},      
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao', "data":'$INGRESSO.data'}, 
          count:{$count:{}}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-tipo-operacao", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },  
          { $match : { status_compra : '3' }},    
          {$group : {_id:{"forma_pagamento":'$forma_pagamento',"_id":"$forma_pagamento"},valor_compra_unitaria:{$sum:"$valor_compra_unitaria"},
          count:{$count:{}}}}
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

//Recuperar Eventos
router.post("/meus-eventos", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    // console.log(req);
    let query = { id_usuario: String(req.body.id_usuario) };
    let result = await collection.find(query).toArray();
    let id_evento = result.length > 0 ? result[0].id_evento : null;
    let eventos = {};
    // console.log(result.length > 0);
  
    if (id_evento != null) {
      eventos = await collection
        .aggregate([
          { $addFields: { id: { $toObjectId: id_evento } } },
          {
            $lookup: {
              from: "sys-eventos",
              localField: "id",
              foreignField: "_id",
              as: "JOIN",
            },
          },
        ])
        .toArray();
    }
    let error = {};
    // console.log(eventos);
    if (!eventos) res.send(error).status(404);
    else res.send(eventos.length > 0 ? eventos[0].JOIN : eventos).status(200);
  });

  //Alterar Ingresso
router.post("/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $set: { 
      nome: req.body.nome, 
      email: req.body.email, 
      telefone: req.body.telefone, 
      documento: req.body.cpf, 
    }
  }

  // console.log(query);
  // console.log(updates);

  let collection = await db.collection("sys-eventos-inscritos");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});
  
  //Confirmar Ingresso
  router.post("/confirmar/:id", async (req, res) => {
    const query = { _id: ObjectId(req.params.id) };
    let body = req.body;
    // console.log(query);
    // console.log(body);
    const updates = {
      $set: { 
        qr_validado: 'Sim', 
        data_validacao: body.data 
      }
    }
  
    // console.log(query);
    // console.log(updates);
  
    let collection = await db.collection("sys-eventos-inscritos");
    let result = await collection.updateOne(query, updates);
  
    res.send(result).status(200);
  });

export default router;
