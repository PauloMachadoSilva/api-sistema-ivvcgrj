import express from "express";
import axios from 'axios';
import db from "../db/conn.mjs";
import { environment } from "../environments/environment.mjs";
import { BodyCreditCardData } from "../shared/compras/body-cartao-credito.mjs";
import { CompraCreditCardData } from "../shared/compras/compra-credit-card.mjs";
import convert2 from 'simple-xml-to-json';

import CriarSessao from "../shared/functions/session-pagseguro.mjs";
import qs from 'qs'


const router = express.Router();
var tokenCartao;
var data;
var bodyCartaoCredito;
var bodyCompraCartaoCreditoHML;
var bodyCompraCartaoCreditoPRD;

//Recuperar Ingressos
router.post("/", async (req, res) => {
    let valor = String(req.params.valor);
    let params = req.body;
    let dadosUsuario;
    let dadosInscricao;
    let dadosCartao;

    let usuario = params.forEach((ret)=>{
        dadosUsuario = ret.usuario
    })

    let inscricao = params.forEach((ret)=>{
        dadosInscricao = ret.inscricao
    })

    let cartao = params.forEach((ret)=>{
        dadosCartao = ret.dadosCartao
    })

    

    const options = {
        headers: {'Content-Type': 'application/xml'}
      };

      const urlencoded = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
      };

    //Retorna Session
    const sessao = await CriarSessao();
    
    bodyCartaoCredito = BodyCreditCardData.BODY_CARTAO_CREDITO_HOM(params,sessao)
    //Criar token do cartao
    axios.post(`${environment.pagSeguroSandBox.obterTokenCartao}`,qs.stringify(bodyCartaoCredito),urlencoded)
      .then(function (response) {
        let tokenCartao = response.data.token;
        // console.log(tokenCartao);
        // console.log('dadosInscricao[0]',dadosInscricao[0].codigo_referencia);
        
        //Homologação
        bodyCompraCartaoCreditoHML = CompraCreditCardData.CREDIT_CARD_HOM(dadosUsuario,tokenCartao, dadosInscricao[0].codigo_referencia, dadosCartao)
       
        // Envio pedido de compra
        axios.post(`${environment.pagSeguroSandBox.realizarCompraCartaoCredito}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroSandBox.token}`,bodyCompraCartaoCreditoHML,options)
            .then(function (response) {
                //Homologação
                let ret = convert2.convertXML(response.data);
                let status = ret['transaction']['children'][4].status.content;
                let paymentMethod = ret['transaction']['children'][6].paymentMethod;
                let code = ret['transaction']['children'][1].code.content;
                let reference = ret['transaction']['children'][2].reference.content;

                //Persistir no banco
                IncluirCompra(dadosInscricao,status);

                let error = {}
                if (!status) res.send(error).status(404);
                else res.send(status).status(200);
            })
            .catch(function (error) {
                console.log(error);
            });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  async function IncluirCompra(dadosInscricao, status){
    let collection = await db.collection("sys-eventos-inscritos");
    // console.log('dadosInscricao->',dadosInscricao);
    let asinscricoes = dadosInscricao.forEach(async (ret)=>{
        // console.log('ret->>>',ret)
        ret.status_compra = status;
        await collection.insertOne(ret);
    })    
  }


export default router;
