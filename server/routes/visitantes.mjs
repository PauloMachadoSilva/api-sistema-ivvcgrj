import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
    let collection = await db.collection("visitantes");
    let results = await collection.find({})
      // .limit(50)
      .toArray();
  
    res.send(results).status(200);
  });

// Get a list of 50 posts
router.post("/", async (req, res) => {
    let collection = await db.collection("visitantes");
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  });


  router.post("/alterar-visitante/:telefone", async (req, res) => {
    const query = { telefone: String(req.params.telefone) };
    const updates = {
      $set: { 
        nome: req.body.nome, 
        telefone: req.body.telefone, 
        data: req.body.data, 
        convidado_por: req.body.convidado_por, 
        como_conheceu: req.body.como_conheceu, 
        departamentos: req.body.departamentos, 
        usuario: req.body.usuario, 
      }
    };
  
    let collection = await db.collection("visitantes");
    let result = await collection.updateOne(query, updates);
  
    res.send(result).status(200);
  });



export default router;
