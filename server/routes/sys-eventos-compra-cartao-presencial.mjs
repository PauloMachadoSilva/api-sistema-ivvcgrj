import express from "express";
import db from "../db/conn.mjs";
import enviarEmail from "../emails/index.mjs";
import logsSysEventos from "../logs/logs-sys-eventos.mjs";



const router = express.Router();

//Venda Presencial
router.post("/", async (req, res) => {
    let valor = String(req.params.valor);
    let params = req.body;
    let dadosUsuario;
    let dadosInscricao;
    let dadosCompra;
    let dadosResponsaveis;
    let result;
    var resp;

    let usuario = params.forEach((ret)=>{
        dadosUsuario = ret.usuario
    })

    let inscricao = params.forEach((ret)=>{
        dadosInscricao = ret.inscricao
    })

    let responsaveis = params.forEach((ret) => {
        dadosResponsaveis = ret.dadosResponsaveis;
      });

    let compra = params.forEach((ret)=>{
        dadosCompra = ret.dadosCompra
    })

    // console.log('dadosUsuario->',dadosUsuario);
    // console.log('dadosInscricao->',dadosInscricao);
    // console.log('dadosResponsaveis->',dadosResponsaveis);

    //### CADEIRAS NUMERADAS ###
  let isValid = await validarCadeiras(dadosInscricao);
  if(isValid){
    resp = "77";
    res.send(resp).status(200);
    return;
  }
    
    let collection = await db.collection("sys-eventos-inscritos");
    let dadosResp = dadosResponsaveis ? dadosResponsaveis : null
    let asinscricoes = dadosInscricao.forEach(async (ret)=>{
        ret.status_compra = '3';
        ret.codigo_presencial = dadosCompra.codigo_presencial;
        if (dadosResp)
            ret.dados_responsaveis = dadosResp;

        result =  await collection.insertOne(ret);
    })    

    let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
    let testeEmail = parse_email.test(dadosCompra.email);
    //Validar o email
    if (dadosCompra.email && testeEmail === true) {
        let dadosEmail= {
            email: dadosCompra.email,
            subject: 'Compra aprovada!',
            texto: 'Ingressos'
        }

        setTimeout(async () => {
            enviarEmail(dadosInscricao[0].codigo_referencia,dadosEmail)
        }, 2000);
    }

    result = '3'
    let error = {}
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);

    let log_result = await logsSysEventos(3, 200, dadosUsuario, dadosInscricao, 'presencial');

    
})

async function validarCadeiras(inscricoes) {
    let collection = await db.collection("sys-eventos-inscritos");
    let isVendida = false;
    let result;
    for( const inscricao of inscricoes) {
      let query = { id_cadeira: inscricao.cadeira ? inscricao.id_cadeira : 'n', id_evento: inscricao.id_evento, status_compra: '3' };
      result = await collection.findOne(query);
      if (result) {
        isVendida = true
      }
    }
    return isVendida
   }
export default router;
