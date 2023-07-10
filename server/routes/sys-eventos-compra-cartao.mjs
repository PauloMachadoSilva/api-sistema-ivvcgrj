import express from "express";
import axios from "axios";
import db from "../db/conn.mjs";
import { environment } from "../environments/environment.mjs";
import { BodyCreditCardData } from "../shared/compras/body-cartao-credito.mjs";
import { CompraCreditCardData } from "../shared/compras/compra-credit-card.mjs";
import { CompraDebitCardData } from "../shared/compras/compra-debit-card.mjs";
import convert2 from "simple-xml-to-json";
import CriarSessao from "../shared/functions/session-pagseguro.mjs";
import qs from "qs";
import enviarEmail from "../emails/index.mjs";
import enviarEmailErroCartao from "../emails/email-erro-cartao.mjs";
import logsSysEventos from "../logs/logs-sys-eventos.mjs";

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

  let usuario = params.forEach((ret) => {
    dadosUsuario = ret.usuario;
  });

  let inscricao = params.forEach((ret) => {
    dadosInscricao = ret.inscricao;
  });

  let cartao = params.forEach((ret) => {
    dadosCartao = ret.dadosCartao;
  });

  const options = {
    headers: { "Content-Type": "application/xml" },
  };

  const urlencoded = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  };

  //Retorna Session
  const sessao = await CriarSessao();

  // console.log('dadosCartao->',dadosCartao)

  bodyCartaoCredito = BodyCreditCardData.BODY_CARTAO_CREDITO_PRD(
    dadosCartao,
    sessao
  );
  //Criar token do cartao
  axios
    .post(
      `${environment.pagSeguroProd.obterTokenCartao}`,
      qs.stringify(bodyCartaoCredito),
      urlencoded
    )
    .catch(async ({ response }) => {
      // console.log('RESPONSE>',response);
      // console.log(response.headers);
      // console.log(response.status);
      if (response.status !== 200) {
        let retStatus = {
          status_compra: '7',
        };
      
    let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
    let testeEmail = parse_email.test(dadosUsuario.email);
    //Validar o email
    if (dadosUsuario.email && testeEmail === true) {
      //ENVIAR EMAILS DE APROVAÇÃO
      let dadosEmail = {
        email: dadosUsuario.email,
        subject: "Compra não aprovada",
        texto: "Ingressos",
      };

        enviarEmailErroCartao(
          dadosUsuario,
          dadosEmail
        );
    }
        let log_result = await logsSysEventos(response.data, response.status, dadosUsuario, dadosInscricao, `cartao - ${dadosCartao.cardBrand}`);
        res.send(retStatus).status(200);
      }
    })
    .then(async function (response) {
      
      let tokenXml = convert2.convertXML(response.data);
      let error = String(response.data).replace('"','');
      let containError = error.includes('error')

      let tokenCartao = tokenXml.card && !containError ? tokenXml.card.children[0].token.content : '';

      // console.log('tokenCartao>',tokenCartao.card.children[0].token.content);
      // console.log('response>',response);
      // console.log('dadosInscricao[0]',dadosInscricao[0].codigo_referencia);
      let log_result = await logsSysEventos(tokenCartao, 200, dadosUsuario, dadosInscricao, `cartao - ${dadosCartao.cardBrand}`);

      //Homologação
      // console.log('dadosCartao>>>',dadosCartao);
      // bodyCompraCartao = !dadosCartao.senderHash
      // ? CompraCreditCardData.CREDIT_CARD_PRD(dadosUsuario,tokenCartao, dadosInscricao[0].codigo_referencia, dadosCartao)
      // : CompraDebitCardData.DEBIT_CARD(dadosUsuario,dadosInscricao[0], dadosCartao)

      bodyCompraCartao = CompraCreditCardData.CREDIT_CARD_PRD(
        dadosUsuario,
        tokenCartao,
        dadosInscricao[0].codigo_referencia,
        dadosCartao
      );
      //Headers
      // header = !dadosCartao.senderHash ? options : urlencoded

      header = urlencoded;

      // Envio pedido de compra
      axios
        .post(
          `${environment.pagSeguroProd.realizarCompraCartaoCredito}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,
          bodyCompraCartao,
          header
        )
        .catch(async ({ response }) => {
          // console.log("RESPONSE>", response);
          // console.log(response.headers);
          // console.log(response.status);
          if (response.status !== 200) {
            let retStatus = {
              status_compra: '7',
            };

          let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
          let testeEmail = parse_email.test(dadosUsuario.email);
          //Validar o email
          if (dadosUsuario.email && testeEmail === true) {
            //ENVIAR EMAIL DE NÃO APROVADO
            let dadosEmail = {
              email: dadosUsuario.email,
              subject: "Compra não aprovada",
              texto: "Ingressos",
            };

              enviarEmailErroCartao(
                dadosUsuario,
                dadosEmail
              );
          }
            // console.log("RESPONSE status>", response);
            let log_result = await logsSysEventos(response.data, response.status, dadosUsuario, dadosInscricao, `cartao - ${dadosCartao.cardBrand}`);
            res.send(retStatus).status(200);
          }
        })
        .then(async function (response) {
          if (!response) {
            return;
          }
          //Homologação
          let ret = convert2.convertXML(response.data);

          let status = ret["transaction"]["children"][4].status.content; //Produção
          let paymentMethod = ret["transaction"]["children"][6].paymentMethod;
          let code = ret["transaction"]["children"][1].code.content;

          // console.log('Status Pedido->',code)
          // console.log('response->',response)

          let log_result = await logsSysEventos(code, Number(status), dadosUsuario, dadosInscricao, `cartao - ${dadosCartao.cardBrand}`);

          //Consultar Notificação
          
          setTimeout(async () => {
            await consutarNotificacaoCompra(code);
          }, 2000);  

        })
        .catch(async function (error) {
          console.log(error);
          let log_result = await logsSysEventos(error, 500, dadosUsuario, dadosInscricao, `cartao - ${dadosCartao.cardBrand}`);
        });
    })
    .catch(async function (error) {
      let log_result = await logsSysEventos(error, 500, dadosUsuario, dadosInscricao, `cartao - ${dadosCartao.cardBrand}`);
      console.log(error);
    });

    async function consutarNotificacaoCompra(code) {
      axios
        .get(
          `${environment.pagSeguroProd.realizarCompraCartaoCredito}${code}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,
          header
        )
        .catch(async ({ response }) => {
          // console.log("RESPONSE CONSULTA CATCH>", response);
          // console.log(response.headers);
          // console.log(response.status);

          if (response.status !== 200) {
            let retStatus = {
              status_compra: '7',
            };

            let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
            let testeEmail = parse_email.test(dadosUsuario.email);
            //Validar o email
            if (dadosUsuario.email && testeEmail === true) {

              let dadosEmail = {
                email: dadosUsuario.email,
                subject: "Compra não aprovada",
                texto: "Ingressos",
              };
    
                enviarEmailErroCartao(
                  dadosUsuario,
                  dadosEmail
                );
            }
              let log_result = await logsSysEventos(response.data, response.status, dadosUsuario, dadosInscricao, 'cartao - consulta');
              res.send(retStatus).status(200);
          }
        })
        .then(async function (response) {
          let ret = convert2.convertXML(response.data);
          // console.log("ret>>", ret);
          let status = ret["transaction"]["children"][4].status.content; //Produção
          // console.log("ret>>", status);
          //Persistir no banco
          //Futuramente implementar banco de recusas
          if (Number(status) === 3) {
            let bd = await IncluirCompra(dadosInscricao, status, code);
            let log_result = await logsSysEventos(code, Number(status), dadosUsuario, dadosInscricao, 'cartao - consulta');

          }
          else 
          {
            let log_result = await logsSysEventos(status, response.status, dadosUsuario, dadosInscricao, 'cartao - consulta');

          }

          let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
          let testeEmail = parse_email.test(dadosUsuario.email);
          //Validar o email
          if (dadosUsuario.email && testeEmail === true) {
            //ENVIAR EMAILS DE APROVAÇÃO
            let dadosEmail = {
              email: dadosUsuario.email,
              subject: Number(status) === 3 ? "Compra aprovada!" : "Compra não aprovada",
              texto: "Ingressos",
            };
      
            setTimeout(async () => {
              if (Number(status) === 3) {
                enviarEmail(dadosInscricao[0].codigo_referencia, dadosEmail);
              } else {
                enviarEmailErroCartao(
                  dadosUsuario,
                  dadosEmail
                );
              }
            }, 2000);
          }
    
          let retStatus = {
            status_compra: status,
          };
    
          if (!retStatus) res.send(error).status(404);
          else res.send(retStatus).status(200);
        });
    }
});

async function IncluirCompra(dadosInscricao, status, code){
  let collection = await db.collection("sys-eventos-inscritos");
  // console.log('dadosInscricao->',dadosInscricao);
  let asinscricoes = dadosInscricao.forEach(async (ret)=>{
      // console.log('ret->>>',ret)
      ret.status_compra = status;
      ret.codigo_transacao = code.replaceAll('-','');
      await collection.insertOne(ret);
  })    
}

export default router;
