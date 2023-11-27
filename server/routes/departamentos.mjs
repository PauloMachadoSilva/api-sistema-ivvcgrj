import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// Consultar Departamentos
router.get("/", async (req, res) => {
  let collection = await db.collection("departamentos");
  let results = await collection.find({})
    .toArray();

  res.send(results).status(200);
});



export default router;
