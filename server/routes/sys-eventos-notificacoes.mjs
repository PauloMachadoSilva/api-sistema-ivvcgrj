import express from "express";
import axios from 'axios';
import convert from 'xml-js';
import { environment } from "../environments/environment.mjs";


const router = express.Router();
var obj;
//Recuperar Parcelas
router.post("/", async (req, res) => {
    console.log('req>>>',req)
    let notificacao = String(req.params.notificationCode);
    const options = {
        headers: {accept: 'application/xml'}
      };
    //Criando sessao
    axios.post(`${environment.pagSeguroProd.consultarNotificacoes}/${notificacao}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,options)
      .then(function (response) {
        //Tratativa de gravar no banco e enviar email
        //<status>3</status> 
        let ret = JSON.parse(convert.xml2json(response.data));
        let status = ret["transaction"]["children"][4].status.content; //Produção
        console.log(status);
      })
      .catch(function (error) {
        console.log(error);
      });
  });


export default router;
