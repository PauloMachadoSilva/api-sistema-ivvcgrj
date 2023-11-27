import express from "express";
import db from "../db/conn.mjs";

export default async function logsFunction(params) {
  let collection = await db.collection("logs");
  let newDocument = params;
  let result = await collection.insertOne(newDocument);
  return result;
}


