import express from "express";
import axios from 'axios';
import db from "../db/conn.mjs";
import { environment } from "../environments/environment.mjs";
import { BodyCreditCardData } from "../shared/compras/body-cartao-credito.mjs";
import { CompraCreditCardData } from "../shared/compras/compra-credit-card.mjs";
import { CompraDebitCardData } from "../shared/compras/compra-debit-card.mjs";
import convert2 from 'simple-xml-to-json';
import CriarSessao from "../shared/functions/session-pagseguro.mjs";
import qs from 'qs'
import enviarEmail from "../emails/index.mjs";


const router = express.Router();
var tokenCartao;
var data;
var bodyCartaoCredito;
var bodyCompraCartao;
var bodyCompraCartaoCreditoPRD;
var header;

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
        // console.log('dadosCartao>>>',dadosCartao);
        bodyCompraCartao = !dadosCartao.senderHash 
        ? CompraCreditCardData.CREDIT_CARD_HOM(dadosUsuario,tokenCartao, dadosInscricao[0].codigo_referencia, dadosCartao)
        : CompraDebitCardData.DEBIT_CARD(dadosUsuario,tokenCartao, dadosCartao)
        
        //Headers
        header = !dadosCartao.senderHash ? options : urlencoded
        
        // Envio pedido de compra
        axios.post(`${environment.pagSeguroSandBox.realizarCompraCartaoCredito}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroSandBox.token}`,bodyCompraCartao,header)
            .then(async function (response) {
                //Homologação
                let ret = convert2.convertXML(response.data);
                //STATUS
                // Mudanças de status
                // 1 - Aguardando pagamento
                // 2 - Em análise
                // 3 - Paga
                // 4 - Disponível
                // 5 - Em disputa
                // 6 - Devolvida
                // 7 - Cancelada
                // 8 - Debitado
                // 9 - Retenção temporária
                let status = ret['transaction']['children'][4].status.content;
                let paymentMethod = ret['transaction']['children'][6].paymentMethod;
                let code = ret['transaction']['children'][1].code.content;
                // let reference = ret['transaction']['children'][2].reference.content;

                //Persistir no banco
                let bd = await IncluirCompra(dadosInscricao,status);
                
                //ENVIAR EMAILS DE APROVAÇÃO
                let dadosEmail= {
                  email: dadosUsuario.email,
                  subject: 'Compra aprovada!',
                  texto: 'Ingressos'
                }
                
                setTimeout(async () => {
                  enviarEmail(dadosInscricao[0].codigo_referencia,dadosEmail)
                }, 2000);
                
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
