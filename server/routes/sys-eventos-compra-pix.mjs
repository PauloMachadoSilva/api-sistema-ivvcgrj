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
  let dadosValorPix;

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

  let valorPix = params.forEach((ret) => {
    dadosValorPix = ret.valorPix;
  });

  //   console.log('dadosInscricao',dadosInscricao)
  //   console.log('dadosCompra',dadosCompra)
  //   console.log('dadosValorPix',dadosValorPix)
  //   return;

  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.pagSeguroProd.token}`,
    },
  };

  let dataAtual = new Date().setMinutes(new Date().getMinutes() + 15, 0, 0);
  let dataFormatada = toIsoString(new Date(dataAtual));
  // console.log('dataF>',data);
  // console.log('dataAtual>',data);

  bodyPix = BodyCompraPixData.BODY_PIX_PRD(
    dadosUsuario,
    dadosValorPix,
    dadosInscricao[0].codigo_referencia,
    dataFormatada
  );
  // console.log('bodyPix>',bodyPix);

  //GERANDO PIX
  axios
    .post(`${environment.pagSeguroProd.gerarPagamentoPix}`, bodyPix, options)
    .catch(async ({ response }) => {
      console.log("RESPONSE1 CATCH", response);
      //   console.log('RESPONSE2>',response.data);
      // console.log(response.headers);
      // console.log(response.status);
      let log_result = await logsSysEventos(
        response.data,
        response.status,
        dadosUsuario,
        dadosInscricao,
        "pix"
      );

      resp = {
        status_compra: "7",
      };
      res.status(400).send(resp);
    })
    .then(async function (response) {
      //   console.log("response>>", response);
      if (response) {
        let resp = response.data;
        resp.status_compra = "99";
        res.send(resp).status(200);
        //GERANDO COMPRA PENDENTE
        let bd = await IncluirCompra(dadosInscricao, "1", response.data.id);

        //GERANDO LOG
        let log_result = await logsSysEventos(
          response.data,
          response.status,
          dadosUsuario,
          dadosInscricao,
          "pix-pendente"
        );
      }
    });
});

//VALIDANDO PAGAMENTO JANELA ABERTA
router.post("/validar-pix", async (req, res) => {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.pagSeguroProd.token}`,
    },
  };

  let params = req.body;
  //   console.log("RESPONSE1>", params);
  axios
    .get(
      `${environment.pagSeguroProd.consultarPagamentoPix}/${params.codigo}`,
      options
    )
    .catch(async ({ response }) => {
      //   console.log("RESPONSE1>", response);
      //   console.log("RESPONSE2>", response.data);

      let resp = response.data;
      resp.status === 400 ? res.status(400).send("") : res.status(400).send("");
    })
    .then(async function (response) {
      //GERANDO LOG
      let log_result = await logsSysEventos(
        response.data,
        response.status,
        response.data.customer,
        response.data.items,
        "pix-aprovado-tela"
      );
      let retorno = response ? response : null;
    //   console.log("response>>", response.data);
      let charges = response.data.charges ? response.data.charges : null;
      if (charges !== null) {
        if (String(charges[0].status).toLowerCase() === "paid") {
          //Compra Aprovada
          resp = {
            status_compra: "3",
            data: charges, //Retirar
          };
          resp !== undefined || ""
            ? res.send(resp).status(200)
            : res.send("").status(400);

          //ATUALIZANDO COMPRA APROVADA
          let bd = await AtualizarCompra(response.data.id);

          //ENVIAR EMAIL DE APROVAÇÃO
          let dadosEmail = {
            email: response.data.customer.email,
            subject: "Compra aprovada!",
            texto: "Ingressos",
          };

          setTimeout(async () => {
            enviarEmail(response.data.reference_id, dadosEmail);
          }, 2000);
        } else {
          resp = {
            status_compra: "99",
            data: "Pendente",
          };
          resp !== undefined || ""
            ? res.send(resp).status(200)
            : res.send("").status(400);
        }
      } else {
        //Verificar data de expiração em 1 - 15m
        let expiration_date = response.data
          ? response.data.qr_codes[0].expiration_date
          : "";
        // console.log("expiration_date>>>", expiration_date);
        let dataAtual = new Date().getTime();
        let dataExpiracao = new Date(expiration_date).getTime();
        let compare = dataAtual > dataExpiracao;
        let ret = response ? response.data : null;
        resp = {
          status_compra: "Pendente",
          data: ret,
          expirado: compare,
        };
        resp !== undefined || ""
          ? res.send(resp).status(200)
          : res.send("").status(400);
      }
    });
});

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

async function IncluirCompra(dadosInscricao, status, code) {
  let collection = await db.collection("sys-eventos-inscritos");
  // console.log('dadosInscricao->',dadosInscricao);
  let asinscricoes = dadosInscricao.forEach(async (ret) => {
    // console.log('ret->>>',ret)
    ret.status_compra = status;
    ret.codigo_transacao = code;
    await collection.insertOne(ret);
  });
}

async function AtualizarCompra(codigo) {
//   console.log("codigo>>>", codigo);
  const query = { codigo_transacao: codigo };
  const updates = {
    $set: { status_compra: "3" },
  };

  let collection = await db.collection("sys-eventos-inscritos");
  let result = await collection.updateMany(query, updates);
//   console.log("Result>>>", result);
}

export default router;
