import express from "express";
import db from "../db/conn.mjs";

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
    result = '3'
    let error = {}
    if (!result) res.send(error).status(404);
    else res.send(result).status(200);
})


export default router;
