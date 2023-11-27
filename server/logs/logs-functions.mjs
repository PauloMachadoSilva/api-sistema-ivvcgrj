import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

export default async function logsFunction(params) {
  // console.log(params)
  let collection = await db.collection("logs");
  let newDocument = tratarParams(params);
  let result = await collection.insertOne(newDocument);
  if (newDocument.tipo === 1) {
    let collectionNotificacao = await db.collection("notificacoes");
    const notificacao = {
      data: newDocument.data,
      status: 0,
      acao: newDocument.collection_acao,
      cpf: newDocument.campos_atualizados[1].valor, // Pegando CPF
      nome: newDocument.campos_atualizados[0].valor, // Pegando CPF
    }
    console.log(notificacao);
    let resultNotificacao = await collectionNotificacao.insertOne(notificacao);
  }
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
//console.log(param)
return param;

function tratarData() {
  let dataAjustada = new Date();
  let h = dataAjustada.getHours() -3;
  dataAjustada.setHours(h);
  return dataAjustada
}
  
}
