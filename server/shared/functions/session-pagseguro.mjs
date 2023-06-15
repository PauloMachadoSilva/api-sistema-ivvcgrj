import express from "express";
import axios from "axios";
import convertXML from "simple-xml-to-json";
import convert from "xml-js";
import { environment } from "../../environments/environment.mjs";

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
      .then(function (response) {
        let ret = JSON.parse(convert.xml2json(response.data));
        obj = ret.elements[0].elements[0].elements[0].text; 
        return obj; 
      })
      .catch(function (error) {
        console.log(error);
      });
  }
