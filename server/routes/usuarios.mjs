import express from "express";
import db from "../db/conn.mjs";
import { Int32, ObjectId } from "mongodb";
import logsFunction from '../logs/logs-functions.mjs'
import logsLoginFunction from '../logs/logs.login-functions.mjs'



const router = express.Router();

//Consultar todos os usuários
router.get("/", async (req, res) => {
  let collection = await db.collection("usuarios");
  let results = await collection.find({})
    // .limit(50)
    .toArray();

  res.send(results).status(200);
});

// Fetches the latest posts
router.get("/latest", async (req, res) => {
  let collection = await db.collection("usuarios");
  let results = await collection.aggregate([
    {"$project": {"author": 1, "title": 1, "tags": 1, "date": 1}},
    {"$sort": {"date": -1}},
    {"$limit": 3}
  ]).toArray();
  res.send(results).status(200);
});

//Validar CPF
router.get("/:cpf", async (req, res) => {
  let collection = await db.collection("usuarios");
  let query = {cpf: String(req.params.cpf)};
  let result = await collection.findOne(query);
  let error = {}

  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

// Adicionando usuários
router.post("/", async (req, res) => {
  let collection = await db.collection("usuarios");
  let newDocument = req.body;
  newDocument.date = tratarData();
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);

  let log = newDocument;
  log.acao = 'cadastro-usuario';
  log.nome_collection = 'usuario';
  log.metodo = 'post';
  log.tipo = 1 // 0: Não gera notificação 1: Gera notificação 
  let log_result = await logsFunction(log)
});

// Login
router.post("/login", async (req, res) => {
  let collection = await db.collection("usuarios");
  let params = req.body;
  let query = {email: String(params.email), senha: String(params.senha)};
  let result = await collection.findOne(query);
  if (result?.aprovado === 'Não')
    result = {};
  let error = {}
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
 
  //logs
  if (result != null) {
  let log = result;
  log.acao = 'login';
  log.nome_collection = 'usuario';
  log.metodo = 'post';
  log.tipo = 0 // 0: Não gera notificação 1: Gera notificação 
  let log_result = await logsLoginFunction(log)
  }
});

//Alterar senha
router.post("/alterar-senha/:email", async (req, res) => {
  const query = { email: String(req.params.email) };
  const updates = {
    $set: { senha: req.body.senha }
  };

  let collection = await db.collection("usuarios");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);

   //logs
   let log = {};
   log.nome = req.body.email;
   log.acao = 'alterar-senha';
   log.nome_collection = 'usuario';
   log.metodo = 'post';
   log.tipo = 0 // 0: Não gera notificação 1: Gera notificação 
  let log_result = await logsLoginFunction(log)
});

//Alterar cadastro
router.post("/alterar-cadastro/:cpf", async (req, res) => {
  // console.log(req.body)
  const query = { cpf: String(req.params.cpf) };
  const updates = {
    $set: { 
      nome: req.body.nome, 
      aprovado: req.body.aprovado, 
      cpf: req.body.cpf, 
      email: req.body.email, 
      telefone: req.body.telefone, 
      // departamentos: req.body.departamentos, 
      // endereco: req.body.endereco, 
      // discipulado: req.body.discipulado, 
      data: req.body.data,
      nascimento: req.body.nascimento,
      // rhema : req.body.rhema,  
      whatsapp: req.body.whatsapp,  
    }
  };

  let collection = await db.collection("usuarios");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);

  //logs
  let log = req.body;
  log.acao = 'atualizar-cadastro';
  log.nome_collection = 'usuario';
  log.metodo = 'post';
  log.tipo = 0 // 0: Não gera notificação 1: Gera notificação 
  let log_result = await logsFunction(log)
});

//Recuperar Senha
router.post("/recuperar-senha/:email", async (req, res) => {
  let collection = await db.collection("usuarios");
  let query = {email: String(req.params.email)};
  let result = await collection.findOne(query);
  let error = {}
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);

   //logs
   let log = result;
   log.acao = 'recuperar-senha';
   log.nome_collection = 'usuario';
   log.metodo = 'post';
   log.tipo = 0 // 0: Não gera notificação 1: Gera notificação 
   let log_result = await logsLoginFunction(log)
});


// Não Implementado
router.delete("/:id", async (req, res) => {
  // const query = { _id: ObjectId(req.params.id) };

  // const collection = db.collection("usuarios");
  // let result = await collection.deleteOne(query);

  // res.send(result).status(200);
});

function tratarData() {
  let dataAjustada = new Date();
  let h = dataAjustada.getHours() -3;
  dataAjustada.setHours(h);
  return dataAjustada
}

export default router;
