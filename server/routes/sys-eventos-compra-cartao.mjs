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

  bodyCartaoCredito = BodyCreditCardData.BODY_CARTAO_CREDITO_PRD(
    dadosCartao,
    sessao
  );
  //Criar token do cartao
  axios
    .post(
      `${environment.pagSeguroSandBox.obterTokenCartao}`,
      qs.stringify(bodyCartaoCredito),
      urlencoded
    )
    .catch(({ response }) => {
      // console.log('RESPONSE>',response.data);
      // console.log(response.headers);
      // console.log(response.status);
      if (response.status !== 200) {
        res.send("7").status(200);
      }
    })
    .then(function (response) {
      let tokenCartao = response.data.token;
      // console.log(tokenCartao);
      // console.log('dadosInscricao[0]',dadosInscricao[0].codigo_referencia);

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
        .catch(({ response }) => {
          console.log("RESPONSE>", response);
          // console.log(response.headers);
          // console.log(response.status);
          if (response.status !== 200) {
            res.send("7").status(200);
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

          //Consultar Notificação
          consutarNotificacaoCompra(code);

        })
        .catch(function (error) {
          console.log(error);
        });
    })
    .catch(function (error) {
      console.log(error);
    });

    async function consutarNotificacaoCompra(code) {
      axios
        .get(
          `${environment.pagSeguroProd.realizarCompraCartaoCredito}${code}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,
          header
        )
        .catch(({ response }) => {
          // console.log("RESPONSE CONSULTA CATCH>", response);
          // console.log(response.headers);
          // console.log(response.status);
          if (response.status !== 200) {
            res.send("7").status(200);
          }
        })
        .then(async function (response) {
          let ret = convert2.convertXML(response.data);
          // console.log("ret>>", ret);
          let status = ret["transaction"]["children"][4].status.content; //Produção
    
          //Persistir no banco
          //Futuramente implementar banco de recusas
          if (status === 3) {
            let bd = await IncluirCompra(dadosInscricao, status, code);
          }
          //ENVIAR EMAILS DE APROVAÇÃO
          let dadosEmail = {
            email: dadosUsuario.email,
            subject: status === 3 ? "Compra aprovada!" : "Compra não aprovada",
            texto: "Ingressos",
          };
    
          setTimeout(async () => {
            if (status === 3) {
              enviarEmail(dadosInscricao[0].codigo_referencia, dadosEmail);
            } else {
              enviarEmailErroCartao(
                dadosUsuario,
                dadosEmail
              );
            }
          }, 2000);
    
          let retStatus = {
            status_compra: status,
          };
    
          if (!retStatus) res.send(error).status(404);
          else res.send(retStatus).status(200);
        });
    }
});


export default router;
