import express from "express";
import axios from "axios";
import convertXML from "simple-xml-to-json";
import convert from "xml-js";
import { environment } from "../../environments/environment.mjs";
import logsSysEventos from "../../logs/logs-sys-eventos.mjs";


const options = {
    headers: {accept: 'application/xml'}
  };
var obj='';

  export default async function CriarSessao () {
    //Criando sessao
    return await axios
      .post(
        `${environment.pagSeguroProd.criarSecao}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,
        options
      )
      .then(async function (response) {
        let ret = JSON.parse(convert.xml2json(response.data));
        obj = ret.elements[0].elements[0].elements[0].text;
        let log_result = await logsSysEventos(obj, 200, environment.pagSeguroProd.contaEmail, '', 'sessions'); 
        return obj; 
      })
      .catch(async function (error) {
        let log_result = await logsSysEventos(error, 500, environment.pagSeguroProd.contaEmail, '', 'sessions');
        console.log(error);
      });
  }
