
import express from "express";
import db from "../db/conn.mjs";
import { Int32, ObjectId } from "mongodb";


const router = express.Router();

// Adicionando usuários
router.post("/", async (req, res) => {
    let collection = await db.collection("sys-eventos-formulario-duvidas");
    let newDocument = req.body;
    newDocument.date = tratarData();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  });

  function tratarData() {
    let dataAjustada = new Date();
    let h = dataAjustada.getHours() -3;
    dataAjustada.setHours(h);
    return dataAjustada
  }
export default router;