import express from "express";
import axios from "axios";
import convert from "xml-js";
import { environment } from "../environments/environment.mjs";
import logsSysEventos from "../logs/logs-sys-eventos.mjs";
import enviarEmail from "../emails/index.mjs";
import db from "../db/conn.mjs";

const router = express.Router();
var obj;
var emailUsuario;
var codigoReferencia;
//RECUPERAR NOTIFICAÇÕES

router.use(express.urlencoded({ extended: false }));
router.post("/", async (req, res) => {
  console.log("body>>>", req.body.notificationCode); // status 4 ou 3
  // return;
  // let notificacao = String(req.body.notificationCode);
  let notificacao = String(req.body ? req.body.notificationCode : '');
  const options = {
    headers: { accept: "application/xml" },
  };
  //Criando sessao
  axios
    .get(
      `${environment.pagSeguroProd.consultarNotificacoes}/${notificacao}?email=${environment.pagSeguroProd.contaEmail}&token=${environment.pagSeguroProd.token}`
    )
    .then(async function (response) {
      //Tratativa de gravar no banco e enviar email
      //<status>3</status>
      let ret = JSON.parse(convert.xml2json(response.data));
      // console.log('ret',ret["elements"][0].elements[4].elements[0].text);
      let status = ret["elements"][0].elements[4].elements[0].text; // Status: 4 (Disponivel na conta) | 3 (Pago)
      let codigo_referencia = ret["elements"][0].elements[2].elements[0].text; // Status: 4 (Disponivel na conta) | 3 (Pago)
      codigoReferencia = codigo_referencia;
      let email = ret["elements"][0].elements[17].elements[1].elements[0].text; // Status: 4 (Disponivel na conta) | 3 (Pago)
      emailUsuario = email;
      // console.log("status>", codigo_referencia);
      // return;

      if (Number(status) === 3 || Number(status) === 4) {
        //ATUALIZANDO COMPRA APROVADA
        let bd = await AtualizarCompra(codigo_referencia);
        
        let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
        let testeEmail = parse_email.test(email);
        //Validar o email
        if (email && testeEmail === true) {
          //ENVIAR EMAIL DE APROVAÇÃO
          let dadosEmail = {
            email: email,
            subject: "Compra aprovada!",
            texto: "Ingressos",
          };

          setTimeout(async () => {
            enviarEmail(codigo_referencia, dadosEmail);
          }, 2000);
        }

        //GERANDO LOG
        let log_result = await logsSysEventos(
          Number(status),
          200,
          emailUsuario,
          codigoReferencia,
          "pix-notificacao"
        );
      }
      else 
      {
        let log_result = await logsSysEventos(
          status,
          200,
          emailUsuario,
          codigoReferencia,
          "pix-notificacao"
        );
      }
      res.send(status).status(200);
    })
    .catch(async function (error) {
      let log_result = await logsSysEventos(
        'erro ao consultar notificação',
        400,
        emailUsuario,
        codigoReferencia,
        "pix-notificacao"
      );

      let resp = {
        status_compra: "7",
      };
      res.status(400).send(resp);
    });
});

async function AtualizarCompra(codigo) {
  //   console.log("codigo>>>", codigo);
  const query = { codigo_referencia: codigo };
  const updates = {
    $set: { status_compra: "3" },
  };

  let collection = await db.collection("sys-eventos-inscritos");
  let result = await collection.updateMany(query, updates);
  // console.log("Result>>>", result);
  let promo = await AtualizarIngressoPromocional(codigo);

}

async function AtualizarIngressoPromocional(codigo){
  let collection = await db.collection("sys-eventos-ingressos-promocionais");
  let collectionInscricao = await db.collection("sys-eventos-inscritos");
  // console.log(usuario)
  // const query = { email: usuario.email };
  const queryInscritos = { codigo_referencia: codigo };
  const updates = {
      $set: {
        data_validado: tratarData(),
        validado: true,
        ativo: false
      },
    };
  //Pesquisando inscricao
  let find =  await collectionInscricao.findOne(queryInscritos);
  if (find.id_promocional) {
    const query = { email: find.email, _id: ObjectId(find.id_promocional) };
    //Atualizando Promocional
    let result = await collection.updateOne(query, updates); 
  }       
}

function tratarData() {
  let dataAjustada = new Date();
  let h = dataAjustada.getHours() -3;
  dataAjustada.setHours(h);
  return dataAjustada
}
export default router;
