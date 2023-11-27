import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();

router.get("/:status", async (req, res) => {
  let status = String(req.params.status);
  console.log(status,'<<<')
  let collection = await db.collection("pedidos");
  let query = {status : status === 'pedido' ? undefined : status };
  let results = await collection
    .find(query)
    // .limit(50)
    .toArray();

  res.send(results).status(200);
});

router.get("/retirada", async (req, res) => {
    let status = String(req.params.status);
    console.log(status,'<<<')
    let collection = await db.collection("pedidos");
    let query = {status : 'retirada' };
    let results = await collection
      .find(query)
      // .limit(50)
      .toArray();
  
    res.send(results).status(200);
  });

router.post("/", async (req, res) => {
  let body = req.body;
  let collection = await db.collection("pedidos");
  let result = await collection.insertOne(body);
  res.send(result).status(200);
});

router.post("/confirmar", async (req, res) => {
  let body = req.body;
  const query = { _id: ObjectId(body._id) };
  const updates = {
    $set: { 
      status: 'pronto', 
    }
  }

  let collection = await db.collection("pedidos");
  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);
});

router.post("/recusar", async (req, res) => {
    let body = req.body;
    console.log(body,'<<<<')
    const query = { _id: ObjectId(body._id) };
    const updates = {
      $set: { 
        status: 'recusado', 
      }
    }
  
    console.log(query);
    console.log(updates);
  
    let collection = await db.collection("pedidos");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  });

  router.post("/retornar", async (req, res) => {
    let body = req.body;
    const query = { _id: ObjectId(body._id) };
    const updates = {
      $set: { 
        status: undefined, 
      }
    }
  
    console.log(query);
    console.log(updates);
  
    let collection = await db.collection("pedidos");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  });

  router.post("/retirada", async (req, res) => {
    let body = req.body;
    const query = { _id: ObjectId(body._id) };
    const updates = {
      $set: { 
        status: 'retirada', 
      }
    }
  
    console.log(query);
    console.log(updates);
  
    let collection = await db.collection("pedidos");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  });

export default router;
