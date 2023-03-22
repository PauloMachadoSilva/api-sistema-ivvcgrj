import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import email from '../emails/index.mjs'

const router = express.Router();


router.post("/", async (req, res) => {
    let newDocument = req.body;
    newDocument.from = new String('pauloems@yahoo.com.br');
    email(newDocument)
    res.send('oi').status(200);
  });
  



export default router;
