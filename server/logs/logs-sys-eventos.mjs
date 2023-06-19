import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

export default async function logsSysEventos(params,statusCode, dadosUsuario, dadosInscricao, tipo) {
//   console.log(params);
  let collection = await db.collection("sys-eventos-logs");
  let newDocument = tratarParams(params, statusCode, dadosUsuario, dadosInscricao, tipo);
  let result = await collection.insertOne(newDocument);
  return result;
}


function tratarParams(params, statusCode, dadosUsuario, dadosInscricao, tipo) {
  //Criando objeto

const param = {
  data_log: tratarData(),
  log: params,
  status_code: statusCode,
  usuario: dadosUsuario,
  inscricao: dadosInscricao,
  tipo: tipo

};
// console.log(param)
return param;

function tratarData() {
  let dataAjustada = new Date();
  let h = dataAjustada.getHours() -3;
  dataAjustada.setHours(h);
  return dataAjustada
}
  
}
