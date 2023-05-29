import express from "express";
import axios from 'axios';
import db from "../db/conn.mjs";
import convertXML from 'simple-xml-to-json';
import convert from 'xml-js';


const router = express.Router();
var obj;
//Recuperar Ingressos
router.get("/:valor", async (req, res) => {
    let valor = String(req.params.valor);
    // console.log(valor)
    const options = {
        headers: {accept: 'application/xml'}
      };
      
    axios.post('https://ws.pagseguro.uol.com.br/v2/sessions?email=pauloems@yahoo.com.br&token=0347E203BE8F4E019D3310CE5368DAC0',options)
      .then(function (response) {
        let ret = JSON.parse(convert.xml2json(response.data));
        obj = ret.elements[0].elements[0].elements[0].text;

        axios.get(`https://pagseguro.uol.com.br/checkout/v2/installments.json?sessionId=${obj}&amount=${valor}&creditCardBrand=${'visa'}`,options)
            .then(function (response) {
                let ret = response.data.installments;
                // console.log(ret)
                // obj = ret.elements[0].elements[0].elements[0].text;
                let error = {}
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
