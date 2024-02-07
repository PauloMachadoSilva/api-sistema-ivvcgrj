import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

export default async function logsFunctionAdm(params) {
  // console.log(params)
  let collection = await db.collection("sys-eventos-logs-adm");
  let newDocument = tratarParams(params);
  let result = await collection.insertOne(newDocument);
return result;
}


function tratarParams(params) {
  //Criando objeto

const param = {
  data: tratarData(),
  metodo: params.metodo ? params.metodo : undefined,
  tipo: params.tipo >= 0 ? params.tipo : undefined,
  usuario: {
    id: params ? params._id : undefined ,
    nome: params ?  params.nome : undefined,
  },
  collection_id: params.id_collection ? params.id_collection : undefined,
  collection_nome: params.nome_collection ? params.nome_collection : undefined,
  collection_acao: params.acao ? params.acao : undefined,
  campos: params.campos
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
