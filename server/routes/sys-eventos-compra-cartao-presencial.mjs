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
    let result;

    let usuario = params.forEach((ret)=>{
        dadosUsuario = ret.usuario
    })

    let inscricao = params.forEach((ret)=>{
        dadosInscricao = ret.inscricao
    })

    let compra = params.forEach((ret)=>{
        dadosCompra = ret.dadosCompra
    })

    // console.log('dadosUsuario->',dadosUsuario);
    // console.log('dadosInscricao->',dadosInscricao);
    // console.log('dadosCompra->',dadosCompra);
    
    let collection = await db.collection("sys-eventos-inscritos");
    let asinscricoes = dadosInscricao.forEach(async (ret)=>{
        ret.status_compra = '3';
        ret.codigo_presencial = dadosCompra.codigo_presencial;
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


export default router;
