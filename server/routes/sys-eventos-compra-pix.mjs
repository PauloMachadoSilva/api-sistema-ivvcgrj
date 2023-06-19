import express from "express";
import axios from "axios";
import db from "../db/conn.mjs";
import { environment } from "../environments/environment.mjs";
import { BodyCompraPixData } from "../shared/compras/body-pix.mjs";
import convert2 from "simple-xml-to-json";
import CriarSessao from "../shared/functions/session-pagseguro.mjs";
import qs, { stringify } from "qs";
import enviarEmail from "../emails/index.mjs";
import enviarEmailErroCartao from "../emails/email-erro-cartao.mjs";
import logsSysEventos from "../logs/logs-sys-eventos.mjs";

const router = express.Router();
var tokenCartao;
var data;
var bodyPix;
var bodyCompraCartao;
var bodyCompraCartaoCreditoPRD;
var header;
var resp;

//Recuperar Ingressos
router.post("/", async (req, res) => {
  let valor = String(req.params.valor);
  let params = req.body;
  let dadosUsuario;
  let dadosInscricao;
  let dadosPix;
  let dadosCompra;

  let usuario = params.forEach((ret) => {
    dadosUsuario = ret.usuario;
  });

  let inscricao = params.forEach((ret) => {
    dadosInscricao = ret.inscricao;
  });

  // let cartao = params.forEach((ret)=>{
  //     dadosPix = ret.dadosPix
  // })

  let tipoCompra = params.forEach((ret) => {
    dadosCompra = ret.tipoCompra;
  });

  // console.log('dadosInscricao',dadosInscricao)
  // console.log('dadosCompra',dadosCompra)
  // return;

  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.pagSeguroSandBox.token}`,
    },
  };

  let dataAtual = new Date().setMinutes(new Date().getMinutes() + 6, 0, 0);
  let dataFormatada = toIsoString(new Date(dataAtual));
  // console.log('dataF>',data);
  // console.log('dataAtual>',data);

  bodyPix = BodyCompraPixData.BODY_PIX_HOM(
    dadosUsuario,
    dadosInscricao,
    dadosInscricao[0].codigo_referencia,
    dataFormatada
  );
  // console.log('bodyPix>',bodyPix);

  //GERANDO PIX
  axios
    .post(`${environment.pagSeguroSandBox.ApiPix}`, bodyPix, options)
    .catch(async ({ response }) => {
      //   console.log('RESPONSE1>',response);
      //   console.log('RESPONSE2>',response.data);
      // console.log(response.headers);
      // console.log(response.status);
      let log_result = await logsSysEventos(response.data, response.status, dadosUsuario, dadosInscricao, 'pix');

    })
    .then(async function (response) {
      // console.log('response>>',response);
      if (response) {
        let resp = response.data;
        resp.status_compra = "99";
        res.send(resp).status(200);
      }

      // Envio pedido de compra
      // axios.post(`${environment.pagSeguroProd.realizarCompraCartaoCredito}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`,bodyCompraCartao,header)
      // .catch(({ response }) => {
      //   console.log('RESPONSE>',response);
      //   // console.log(response.headers);
      //   // console.log(response.status);
      //   if (response.status !== 200) {
      //     res.send('7').status(200);
      //   }
      // })
      // .then(async function (response) {
      //           if (!response) {
      //           return;
      //         }
      //         //Homologação
      //         let ret = convert2.convertXML(response.data);
      //         // console.log('response.data>',ret);
      //         // res.send(ret).status(200);
      //         // return;
      //         //STATUS
      //         // Mudanças de status
      //         // 1 - Aguardando pagamento
      //         // 2 - Em análise
      //         // 3 - Paga
      //         // 4 - Disponível
      //         // 5 - Em disputa
      //         // 6 - Devolvida
      //         // 7 - Cancelada
      //         // 8 - Debitado
      //         // 9 - Retenção temporária

      //         // let status = !dadosCartao.senderHash? ret['transaction']['children'][4].status.content : ret['transaction']['children'][5].status.content;
      //         let status = ret['transaction']['children'][4].status.content; //Produção
      //         let paymentMethod = ret['transaction']['children'][6].paymentMethod;
      //         let code = ret['transaction']['children'][1].code.content;
      //         // let reference = ret['transaction']['children'][2].reference.content;

      //         //Persistir no banco
      //         //Futuramente implementar banco de recusas
      //         if (status === 3) {
      //           let bd = await IncluirCompra(dadosInscricao,status,code);
      //         }
      //         //ENVIAR EMAILS DE APROVAÇÃO
      //         let dadosEmail= {
      //           email: dadosUsuario.email,
      //           subject: status === 3 ? 'Compra aprovada!' : 'Compra não aprovada',
      //           texto: 'Ingressos'
      //         }

      //         setTimeout(async () => {
      //           if (status === 3) {
      //             enviarEmail(dadosInscricao[0].codigo_referencia,dadosEmail)
      //           }
      //           else {
      //             enviarEmailErroCartao(dadosInscricao[0].codigo_referencia,dadosEmail)
      //           }
      //         }, 2000);

      //         let error = {}
      //         if (!status) res.send(error).status(404);
      //         else res.send(status).status(200);

      let log_result = await logsSysEventos(
        99,
        response.status,
        dadosUsuario,
        dadosInscricao,
        'pix'
      );

      //     })
      //     .catch(function (error) {
      //         console.log(error);
      //     });
    });
});

router.post("/validar-pix", async (req, res) => {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.pagSeguroSandBox.token}`,
    },
  };

  let params = req.body;
  console.log("RESPONSE1>", params);
  axios
    .post(
      `${environment.pagSeguroSandBox.ApixValidarPagamentoPix}${params.codigo}`,
      undefined,
      options
    )
    .catch(async ({ response }) => {
      console.log("RESPONSE1>", response);
      console.log("RESPONSE2>", response.data);
      let resp = response.data;

      let log_result = await logsSysEventos(response.data, response.status, dadosUsuario, dadosInscricao);

      // console.log(response.headers);
      // console.log(response.status);
      resp.status === 400 ? res.send("").status(400) : res.send("").status(400);
    })
    .then(function (response) {
      let retorno = response ? response : null;
      console.log("response>>", response);

      resp = {
        status_compra: "99",
        data: retorno === undefined ? response.data : "",
      };
      resp !== undefined
        ? res.send(resp).status(200)
        : res.send("").status(400);
    });
});

async function IncluirCompra(dadosInscricao, status, code) {
  let collection = await db.collection("sys-eventos-inscritos");
  // console.log('dadosInscricao->',dadosInscricao);
  let asinscricoes = dadosInscricao.forEach(async (ret) => {
    // console.log('ret->>>',ret)
    ret.status_compra = status;
    ret.codigo_transacao = code.replaceAll("-", "");
    await collection.insertOne(ret);
  });
}

function toIsoString(date) {
  var tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num) {
      return (num < 10 ? "0" : "") + num;
    };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
}

export default router;
