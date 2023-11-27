import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  let collection = await db.collection("produtos");
  let results = await collection.find({})
    .toArray();
  res.send(results).status(200);
});

router.post("/:texto", async (req, res) => {
    let texto = String(req.params.texto);
    let query;
    if(isNaN(texto)) {
        query = { titulo:  new RegExp(String(texto).toLowerCase())}
    }
    else {
        query = { codigo: Number(texto)};
    }
    console.log('query',query)
    let collection = await db.collection("produtos");
    let result = await collection.find(query).toArray();
    res.send(result).status(200);
  });

export default router;