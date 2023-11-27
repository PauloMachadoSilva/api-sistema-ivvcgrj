import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import email from '../emails/index.mjs'

const router = express.Router();


router.post("/", async (req, res) => {
    let newDocument = req.body;
    console.log(newDocument);
    let send = email(newDocument);
    if (!send) res.send(error).status(404);
    else res.send(send).status(200);
  });
  



export default router;
