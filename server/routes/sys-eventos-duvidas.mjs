
import express from "express";
import db from "../db/conn.mjs";
import enviarEmailFormularioDuvidas from "../emails/email-formulario-duvidas.mjs";

import { Int32, ObjectId } from "mongodb";


const router = express.Router();

// Adicionando usuários
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-formulario-duvidas");
    let newDocument = req.body;
    newDocument.date = tratarData();
    newDocument.resolvido = null;
    // console.log('newDocument',newDocument)
    // return;
    let dadosEmail = {
      email: 'nucleo.operacionalcg@gmail.com',
      subject: 'Formulário de dúvidas - Escola IVVCGRJ',
      texto: 'Formulário de dúvidas - Escola IVVCGRJ'

    }
    let result = await collection.insertOne(newDocument);
    enviarEmailFormularioDuvidas(
      newDocument,
      dadosEmail
    );
    res.send(result).status(204);
  });


  router.post("/responder/:id", async (req, res) => {
    const query = { _id: ObjectId(req.params.id) };
    let body = req.body;
    // console.log(query);
    // console.log(body);
    const updates = {
      $set: { 
        resolvido: tratarData()
      }
    }
  
    // console.log(query);
    // console.log(updates);
  
    let collection = await db.collection("sys-eventos-formulario-duvidas");
    let result = await collection.updateOne(query, updates);
  
    res.send(result).status(200);
  });

  //Consultar todos os usuários
router.get("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-formulario-duvidas");
    let results = await collection.find({})
      // .limit(50)
      .toArray();
  
    res.send(results).status(200);
  });

  router.get("/:id", async (req, res) => {
    let collection = await db.collection("sys-eventos-formulario-duvidas");
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
    const dia = dataAjustada.getDate().toString();
    const diaF = dia.length == 1 ? '0' + dia : dia;
    const mes = (dataAjustada.getMonth() + 1).toString(); //+1 pois no getMonth Janeiro começa com zero.
    const mesF = mes.length == 1 ? '0' + mes : mes;
    const anoF = dataAjustada.getFullYear();
    const hora = dataAjustada.getHours();
    const minutos = dataAjustada.getMinutes();
    return diaF + '/' + mesF + '/' + anoF + ' - ' + (hora) +':'+ (minutos) ;
  }

export default router;