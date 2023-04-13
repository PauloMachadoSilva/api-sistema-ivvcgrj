import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

export default async function logsFunction(params) {
  let collection = await db.collection("logs");
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
    id: params.usuario ? params.usuario.id : undefined ,
    nome: params.usuario ?  params.usuario.nome : undefined,
  },
  collection_id: params.id_collection ? params.id_collection : undefined,
  collection_nome: params.nome_collection ? params.nome_collection : undefined,
  collection_acao: params.acao ? params.acao : undefined,
  campos_antigos: params.campos_antigos ? params.campos_antigos : undefined,
  campos_atualizados: params.campos_atualizados ? params.campos_atualizados : undefined 
};
// console.log(param)
return param;

function tratarData() {
  let dataAjustada = new Date();
  let h = dataAjustada.getHours() -3;
  dataAjustada.setHours(h);
  return dataAjustada
}

  // switch(params.metodo) {
  //   case 'post':
  //     param = {
  //       data: new Date(),
  //       metodo: params.metodo,
  //       tipo: params.tipo,
  //       usuario: {
  //         id: params.usuario.id,
  //         nome: params.usuario.nome,
  //       },
  //       collection: {
  //         nome: params.nome_collection,
  //         acao: params.acao,
  //       },
  //       campos_antigos: params.campos_antigos,
  //       campos_atualizados: params.campos_atualizados
  //     };
  //     break;
  //   case 'update':
  //     param = {
  //       data: new Date(),
  //       metodo: params.metodo,
  //       tipo: params.tipo,
  //       usuario: {
  //         id: params.usuario.id,
  //         nome: params.usuario.nome,
  //       },
  //       collection: {
  //         nome: params.nome_collection,
  //         acao: params.acao,
  //       },
  //       campos_antigos: params.campos_antigos,
  //       campos_atualizados: params.campos_atualizados
  //     };
  //     break;
  //   default:
  // }
  
}
