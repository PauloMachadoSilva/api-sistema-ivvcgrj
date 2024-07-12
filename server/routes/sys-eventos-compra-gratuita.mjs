import express from "express";
import db from "../db/conn.mjs";
import enviarEmail from "../emails/email-inscricao.mjs";
import logsSysEventos from "../logs/logs-sys-eventos.mjs";



const router = express.Router();
var resp;

//Venda Presencial
router.post("/", async (req, res) => {
    let valor = String(req.params.valor);
    let params = req.body;
    let dadosUsuario;
    let dadosInscricao;
    let dadosResponsaveis;
    let dadosFuncionais;
    let dadosCompra;
    let result;

    let usuario = params.forEach((ret)=>{
        dadosUsuario = ret.usuario
    })

    let inscricao = params.forEach((ret)=>{
        dadosInscricao = ret.inscricao
    })

    let responsaveis = params.forEach((ret) => {
        dadosResponsaveis = ret.dadosResponsaveis;
      });

      let funcionais = params.forEach((ret) => {
        dadosFuncionais = ret.dadosFuncionais;
      });

    // let compra = params.forEach((ret)=>{
    //     dadosCompra = ret.dadosCompra
    // })

    // console.log('dadosUsuario->',dadosUsuario);
    // console.log('dadosInscricao->',dadosInscricao);
    // return;

        //### CADEIRAS NUMERADAS ###
  let isValid = await validarCadeiras(dadosInscricao);
  if(isValid){
    resp = "77";
    res.send(resp).status(200);
    return;
  }
    
    
    let collection = await db.collection("sys-eventos-inscritos");
    let dadosResp = dadosResponsaveis ? dadosResponsaveis : null
    let dadosFunc = dadosFuncionais ? dadosFuncionais : null
    let asinscricoes = dadosInscricao.forEach(async (ret)=>{
        ret.status_compra = '3';
        if (dadosResp)
            ret.dados_responsaveis = dadosResp;

        if (dadosFunc)
          ret.dados_funcionais = dadosFunc;
        
        result =  await collection.insertOne(ret);
        // console.log('usuario->',dadosUsuario);
        // let promo = await AtualizarIngressoPromocional(usuario);

    })    

    let parse_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
    let testeEmail = parse_email.test(dadosUsuario.email);
    //Validar o email
    if (dadosUsuario.email && testeEmail === true) {
        let dadosEmail= {
            email: dadosUsuario.email,
            subject: 'Inscrição realizada!',
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

    let log_result = await logsSysEventos(3, 200, dadosUsuario, dadosInscricao, 'gratuita');

    
})

async function AtualizarIngressoPromocional(usuario){
    let collection = await db.collection("sys-eventos-ingressos-promocionais");
    const query = { email: usuario.email };
    const updates = {
        $set: {
          data_validado: tratarData(),
          validado: true,
          ativo: false
        },
      };
    let result = await collection.updateOne(query, updates);        
}

async function validarCadeiras(inscricoes) {
    let collection = await db.collection("sys-eventos-inscritos");
    let isVendida = false;
    let result;
    for( const inscricao of inscricoes) {
      let query = { id_cadeira: inscricao.cadeira ? inscricao.id_cadeira : 'n', id_evento: inscricao.id_evento, status_compra: '3'};
      result = await collection.findOne(query);
      if (result) {
        isVendida = true
      }
    }
    return isVendida
   }
export default router;
