
import express from "express";
import db from "../db/conn.mjs";
import { Int32, ObjectId } from "mongodb";


const router = express.Router();

// Adicionando usuários
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-formulario-duvidas");
    let newDocument = req.body;
    newDocument.date = tratarData();
    newDocument.resolvido = null;
    let result = await collection.insertOne(newDocument);
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
    return dataAjustada
  }
export default router;