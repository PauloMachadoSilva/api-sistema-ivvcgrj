import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";
import logsFunctionAdm from "../logs/logs-functions-adm.mjs";


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
  let query = {id_evento: String(req.body.id_evento), ativo : true, online : true};
  let result = await collection.find(query).sort({ tipo:1, valor : 1, data: 1 }).toArray();
  let error = {}
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

 //Recuperar Ingressos
 router.post("/todos-ingressos", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");
  // console.log(req);
  let query = {id_evento: String(req.body.id_evento)};
  let result = await collection.find(query).sort({ tipo:1, valor : 1, data: 1 }).toArray();
  let error = {}
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

router.post("/id", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");
  // console.log(req);
  let query = {_id: ObjectId(req.body.id_ingresso)};
  let result = await collection.find(query).toArray();
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
          $sort:{'ativo':-1, 'EVENTO.titulo':1,'descricao':1 }
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
  // console.log(req.body.ingresso);
  // return;
  let query = req.body.ingresso;
  query.data = new Date(query.data);
  query.limite = Number(query.limite);
  query.tipo_sistema = 'sys-eventos';
  // console.log(query);
  // return;
  let result = await collection.insertOne(query);
  let log = req.body.usuario;
  log.acao = "cadastrar-ingressos";
  log.nome_collection = "sys-eventos-ingressos";
  log.id_collection = result.insertedId;
  log.metodo = "post";
  log.campos = req.body.ingresso
  log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  log.data = new Date();
  logs(log);
  // return;
  let error = {};
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

//Alterar Evento POST
router.post("/atualizar-ingressos/:id", async (req, res) => {
  let collection = await db.collection("sys-eventos-ingressos");
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $set: {
        titulo: req.body.ingresso.titulo,
        descricao: req.body.ingresso.descricao,
        data: new Date(req.body.ingresso.data),
        id_evento: req.body.ingresso.id_evento,
        observacao: req.body.ingresso.observacao,
        valor: req.body.ingresso.valor,
        tipo: 3,
        limite: Number(req.body.ingresso.limite),
        link_externo: req.body.ingresso.link_externo,
        desconto_progressivo: req.body.ingresso.desconto_progressivo,
        ativo: req.body.ingresso.ativo,
        online: req.body.ingresso.online,
    }
  }
  // console.log('query', query)
  // console.log('updates', updates)
  // return;
  let result = await collection.updateOne(query, updates);

  //logs
  let log = req.body.usuario;
  log.acao = "atualizar-ingressos";
  log.nome_collection = "sys-eventos-ingressos";
  log.id_collection = result;
  log.metodo = "post";
  log.campos = req.body.ingresso
  log.tipo = 0; // 0: Não gera notificação 1: Gera notificação
  log.data = new Date();
  logs(log);
  // return;
  let error = {};
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

async function logs(log) {
  let log_result = await logsFunctionAdm(log);
}
export default router;
