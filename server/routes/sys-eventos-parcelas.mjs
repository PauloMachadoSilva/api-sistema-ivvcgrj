import express from "express";
import axios from 'axios';
import convert from 'xml-js';
import { environment } from "../environments/environment.mjs";


const router = express.Router();
var obj;
//Recuperar Parcelas
router.get("/:valor", async (req, res) => {
    let valor = String(req.params.valor);
    // console.log(valor)
    const options = {
        headers: {accept: 'application/xml'}
      };
    //Criando sessao
    axios.post(`${environment.pagSeguroProd.criarSecao}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,options)
      .then(function (response) {
        let ret = JSON.parse(convert.xml2json(response.data));
        obj = ret.elements[0].elements[0].elements[0].text;
        //Recuperando parcelas
        axios.get(`${environment.pagSeguroProd.obterCondicoesParcelamento}?sessionId=${obj}&amount=${valor}&creditCardBrand=${'visa'}`,options)
            .then(function (response) {
                let ret = response.data.installments;
                let error = {}
                //Retornando parcelas de acordo com o valor
                if (!ret) res.send(error).status(404);
                else res.send(ret).status(200);
            })
            .catch(function (error) {
                console.log(error);
            });
      })
      .catch(function (error) {
        console.log(error);
      });
  });


export default router;
