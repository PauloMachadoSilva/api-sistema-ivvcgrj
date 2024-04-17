import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import logsFunction from "../logs/logs-functions.mjs";

const router = express.Router();

//Recuperar Ingressos por Usuário
router.post("/", async (req, res) => {
  let collection = await db.collection("sys-eventos-inscritos");
  // console.log(req);
  let query = { id_usuario: String(req.body.id_usuario) };
  let result = await collection.find(query).toArray();
  let id_usuario = String(req.body.id_usuario);
  let id_evento = String(req.body.id_evento);
  let ingressos = {};
  let usuarios = {};
  // console.log(result.length > 0);

  if (id_usuario != null) {
    ingressos = await collection
      .aggregate([
        { $match : { id_usuario : id_usuario, id_evento: id_evento, status_compra: {$not: {$eq: '0'}}  } },
        { $addFields: { id: { $toObjectId: id_usuario } } },
        { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
        {
          $lookup: {
            from: "usuarios",
            localField: "id",
            foreignField: "_id",
            as: "USUARIO",
          },
        },
        {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },
          {
            $sort:{'status_compra':1}
          }
      ])
      .toArray();
  }
  let error = {};
//   ingressos = {usuarios};
//   console.log(ingressos);
  if (!ingressos) res.send(error).status(404);
  else res.send(ingressos).status(200);
});


router.post("/todos-eventos-pendentes", async (req, res) => {
  let collection = await db.collection("sys-eventos-inscritos");
  let query = { id_usuario: String(req.body.id_usuario) };
  let result = await collection.find(query).toArray();
  let id_evento = String(req.body.id_evento);
  let id_usuario = String(req.body.id_usuario);
  let ingressos;
  let usuarios = {};
  // console.log(result.length > 0);
  // console.log(id_usuario);
  // return;

  if (id_usuario != null) {
    ingressos = await collection
      .aggregate([
        { $match : { id_usuario : id_usuario, id_evento: id_evento, status_compra: '2' } },
        { $addFields: { id: { $toObjectId: id_usuario } } },
        { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
        {
          $lookup: {
            from: "usuarios",
            localField: "id",
            foreignField: "_id",
            as: "USUARIO",
          },
        },
        {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },
          {
            $sort:{'status_compra':1}
          }
      ])
      .toArray();
  }
  let error = {};
  // ingressos = {usuarios};
  console.log(ingressos);
  if (!ingressos) res.send(error).status(404);
  else res.send(ingressos).status(200);
});

router.post("/carteirinha/", async (req, res) => {
  let dados;
  let collection = await db.collection("sys-eventos");
  // console.log(req);
  // let query = { id_usuario: String(req.body.id_usuario), id_evento: req.body.id_evento };
  // let result = await collection.find(query).toArray();
  let id_usuario = String(req.body.id_usuario);
  // let id_evento = String(req.body.id_evento);
  let ingressos = {};
  let usuarios = {};
  // console.log(query);
  // return;

  if (id_usuario != null) {
    ingressos = await collection
      .aggregate([
        { $match : { tipo_sistema : 'sys-escolas'}},
        { $addFields: { id3: { "$toString": "$_id" } } },
        { $addFields: { id_usuarioField: { "$toObjectId": id_usuario } } },
        { $addFields: { id1: id_usuario } },
          {
              $lookup: {
                from: "sys-eventos-inscritos",
                let: {
                  id_usuario: '$id3',
                },
                pipeline: [
                  { $match: {
                      $expr: { $and: [
                          { $eq: [ "$id_evento", "$$id_usuario" ] },
                          { $eq: [ "$status_compra", "3" ] }
                      ] }
                  } }
                ],
                localField: "id1",
                foreignField: "id_usuario",
                as: "INSCRICAO",
              },
            },
            {
              $lookup: {
                from: "usuarios",
                localField: "id_usuarioField",
                foreignField: "_id",
                as: "USUARIO",
              },
            },
          {
            $sort:{'_id':1}
          }
      ])
      .toArray();
  }
  let error = {};
//   ingressos = {usuarios};
let arr = [];
let arr2 = [];

for( const ingresso of ingressos) {
  arr.push(ingresso.INSCRICAO[0] ? ingresso.INSCRICAO[0]: null);
  arr2.push(ingresso);
  dados = {
      EVENTOS: arr2,
      USUARIO: ingresso.USUARIO,
      INSCRICAO: arr,
      id_inscricao : ingresso._id
  }
  }
  if (!ingressos) res.send(error).status(404);
  else res.send(dados).status(200);
});

router.post("/todas-carteirinhas-escolas/", async (req, res) => {
  let dados;
  let collection = await db.collection("sys-eventos-inscritos");
  // console.log(req);
  // return;
  let query = { id_evento: req.body.id_evento, status_compra:'3' };
  let result = await collection.find(query).sort({nome: 1}).toArray();
  
  if (!result) res.send(error).status(404);
  else res.send(result).status(200);
});

router.post("/todos/", async (req, res) => {
    let dados;
    let collection = await db.collection("sys-eventos-inscritos");
    // console.log(req);
    let query = { id_usuario: String(req.body.id_usuario), id_evento: req.body.id_evento };
    // let result = await collection.find(query).toArray();
    let id_usuario = String(req.body.id_usuario);
    let id_evento = String(req.body.id_evento);
    let ingressos = {};
    let usuarios = {};
    // console.log(query);
    // return;
  
    if (id_usuario != null) {
      ingressos = await collection
        .aggregate([
          { $match : { id_usuario : id_usuario, id_evento: id_evento }},
          { $addFields: { id3: { "$toObjectId": "$id_evento" } } },
          { $addFields: { id_usuario: { "$toObjectId": id_usuario } } },
          { $addFields: { id1: id_usuario } },
            {
                $lookup: {
                  from: "sys-eventos",
                  let: {
                    id_usuario: id_usuario,
                    id_evento: "$id_evento"
                  },
                  pipeline: [
                    { $match: {
                        $expr: { $and: [
                            { $eq: [ "$tipo_sistema", "sys-escolas" ] },
                            // { $eq: [ "$status_compra", "3" ] }
                        ] }
                    } }
                  ],
                  localField: "id3",
                  foreignField: "_id",
                  as: "EVENTOS",
                },
                $lookup: {
                  from: "sys-eventos",
                  let: {
                    id_usuario: id_usuario,
                    id_evento: "$id_evento"
                  },
                  pipeline: [
                    { $match: {
                        $expr: { $and: [
                            { $eq: [ "$tipo_sistema", "sys-escolas" ] },
                            // { $eq: [ "$status_compra", "3" ] }
                        ] }
                    } }
                  ],
                  localField: "id3",
                  foreignField: "_id",
                  as: "EVENTOS",
                },
              },
              {
                $lookup: {
                  from: "usuarios",
                  localField: "id_usuario",
                  foreignField: "_id",
                  as: "USUARIO",
                },
              },
              {
                $lookup: {
                  from: "sys-eventos-inscritos",
                  let: {
                    id_evento: "$id_evento"
                  },
                  pipeline: [
                    { $match: {
                        $expr: { $and: [
                            { $eq: [ "$id_evento", "$$id_evento" ] },
                            // { $eq: [ "$status_compra", "3" ] }
                        ] }
                    } }
                  ],
                  localField: "id1",
                  foreignField: "id_usuario",
                  as: "INSCRICAO",
                },
              },
            {
              $sort:{'_id':1}
            }
        ])
        .toArray();
    }
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
  for( const ingresso of ingressos) {
    dados = {
        EVENTOS: ingresso.EVENTOS,
        USUARIO: ingresso.USUARIO,
        INSCRICAO: ingresso.INSCRICAO,
        id_inscricao : ingresso._id}
  }
    if (!ingressos) res.send(error).status(404);
    else res.send(dados).status(200);
  });

//   router.post("/todos/", async (req, res) => {
//     let collection = await db.collection("sys-eventos");
//     // console.log(req);
//     let query = { id_usuario: String(req.body.id_usuario) };
//     let result = await collection.find(query).toArray();
//     let id_usuario = String(req.body.id_usuario);
//     let ingressos = {};
//     let usuarios = {};
//     // console.log(result.length > 0);
  
//     if (id_usuario != null) {
//       ingressos = await collection
//         .aggregate([
//           { $match : { tipo_sistema : "sys-escolas" }},
//           { $addFields: { id3: { "$toObjectId": "$id_evento" } } },
//           { $addFields: { id1: id_usuario  } },
//             {
//                 $lookup: {
//                   from: "sys-eventos-inscritos",
//                   let: {
//                     id_usuario: id_usuario,
//                     id_evento: "$id_evento"
//                   },
//                   pipeline: [
//                     { $match: {
//                         $expr: { $and: [
//                             { $eq: [ "$id_usuario", "6438463d0080a2488aac202f" ] },
//                             { $eq: [ "$id_evento", "65c79f892691373baa6490e8" ] },
//                             // { $eq: [ "$status_compra", "3" ] }
//                         ] }
//                     } }
//                   ],
//                   localField: "id1",
//                   foreignField: "id_usuario",
//                   as: "INSCRITOS",
//                 },
//               },
//             {
//               $sort:{'_id':1}
//             }
//         ])
//         .toArray();
//     }
//     let error = {};
//   //   ingressos = {usuarios};
//   //   console.log(ingressos);
//     if (!ingressos) res.send(error).status(404);
//     else res.send(ingressos).status(200);
//   });


//Recuperar Ingressos por ID
router.post("/inscricao", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");  
    let ingressos = {};
    let valid = ObjectId.isValid(req.body.id)
    let id = valid ? ObjectId(String(req.body.id)) : null ;
    
    if (id != null) {   
      ingressos = await collection
        .aggregate([
          { $match : { _id : id } },
          { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "usuarios",
              localField: "id",
              foreignField: "_id",
              as: "USUARIO",
            },
          },
          {
              $lookup: {
                from: "sys-eventos-ingressos",
                localField: "id2",
                foreignField: "_id",
                as: "INGRESSO",
              },
            },
        ])
        .toArray();
    }
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.post("/insc", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");  
    let ingressos = {};
    let valid = ObjectId.isValid(req.body.id)
    let id = valid ? ObjectId(String(req.body.id)) : null ;
    
    if (id != null) {   
      ingressos = await collection
        .aggregate([
          { $match : { _id : id } },
          { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "usuarios",
              localField: "id",
              foreignField: "_id",
              as: "USUARIO",
            },
          },
          {
              $lookup: {
                from: "sys-eventos-ingressos",
                localField: "id2",
                foreignField: "_id",
                as: "INGRESSO",
              },
            },
        ])
        .toArray();
    }
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

//Recuperar todos os Ingressos
router.get("/ingressosusuario/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
      let collection = await db.collection("sys-eventos-inscritos");
      let ingressos = {};  
        ingressos = await collection
          .aggregate([
            { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
            { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
            {
              $lookup: {
                from: "usuarios",
                localField: "id",
                foreignField: "_id",
                as: "USUARIO",
              },
            },
            {
                $lookup: {
                  from: "sys-eventos-ingressos",
                  localField: "id2",
                  foreignField: "_id",
                  as: "INGRESSO",
                },
              },
              { $match : { id_evento : id_evento, status_compra : '3' }},       
              
          ])
          .toArray();
      let error = {};
    //   ingressos = {usuarios};
    //   console.log(ingressos);
      if (!ingressos) res.send(error).status(404);
      else res.send(ingressos).status(200);
    });

  //Recuperar todos os Ingressos
router.get("/ingressosid/:id_evento", async (req, res) => {
  let id_evento = String(req.params.id_evento);
  let dados;
  let arr = [];
    let collection = await db.collection("usuarios");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([
          { $addFields: { id: { "$toString": "$_id" } } },
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-inscritos",
              let: {
                id_evento: id_evento
              },
              pipeline: [
                { $match: {
                    $expr: { $and: [
                        { $eq: [ "$status_compra", "3" ] },
                        { $eq: [ "$id_evento", "$$id_evento" ] },
                        { $not: {$eq: [ "$id_usuario", "64902dfef9002f08beb61b23" ]} }
                    ] }
                } }
              ],
              localField: "id",
              foreignField: "id_usuario",
              as: "INSCRITOS",
            },
          },
          {
            $sort:{'INSCRITOS.data_compra':1,}
        }, 
          {
              $lookup: {
                from: "sys-eventos-ingressos",
                localField: "id2",
                foreignField: "_id",
                as: "INGRESSO",
              },
            }         
        ])
        .sort({nome: 1}).toArray();
    let error = {};

  for( const ingresso of ingressos) {
    if (ingresso.INSCRITOS.length > 0) {
        arr.push(ingresso)
        }
  }
//   console.log('arr', arr)
    if (!ingressos) res.send(error).status(404);
    else res.send(arr).status(200);
  });
  
  router.get("/mensalidades-aprovadas/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
      let collection = await db.collection("sys-eventos-inscritos");
      let ingressos = {};  
        ingressos = await collection
          .aggregate([
            { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
            { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
            {
              $lookup: {
                from: "usuarios",
                localField: "id",
                foreignField: "_id",
                as: "USUARIO",
              },
            },
            {
                $lookup: {
                  from: "sys-eventos-ingressos",
                  localField: "id2",
                  foreignField: "_id",
                  as: "INGRESSO",
                },
              },
              {
                $sort:{'nome':1}
              },
              { $match : { id_evento : id_evento, status_compra : '3', valor_compra_unitaria:{$not: {$eq: 0}} }},       
              
          ])
          .toArray();
      let error = {};
    //   ingressos = {usuarios};
    //   console.log(ingressos);
      if (!ingressos) res.send(error).status(404);
      else res.send(ingressos).status(200);
    });

    router.get("/ingressos-todos-escola/ingressosid/:id_evento", async (req, res) => {
      let id_evento = String(req.params.id_evento);
        let collection = await db.collection("sys-eventos-inscritos");
        let ingressos = {};  
          ingressos = await collection
            .aggregate([
              { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
              { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
              {
                $lookup: {
                  from: "usuarios",
                  localField: "id",
                  foreignField: "_id",
                  as: "USUARIO",
                },
              },
              {
                  $lookup: {
                    from: "sys-eventos-ingressos",
                    localField: "id2",
                    foreignField: "_id",
                    as: "INGRESSO",
                  },
                },
                { $match : { id_evento : id_evento, status_compra:{$not: {$eq: '0'},$not: {$eq: '2'}} }},       
                
            ])
            .toArray();
        let error = {};
      //   ingressos = {usuarios};
      //   console.log(ingressos);
        if (!ingressos) res.send(error).status(404);
        else res.send(ingressos).status(200);
      });

  router.get("/ingressos-todos/ingressosid/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
      let collection = await db.collection("sys-eventos-inscritos");
      let ingressos = {};  
        ingressos = await collection
          .aggregate([
            { $addFields: { id: { "$toObjectId": "$id_usuario" } } },
            { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
            {
              $lookup: {
                from: "usuarios",
                localField: "id",
                foreignField: "_id",
                as: "USUARIO",
              },
            },
            {
                $lookup: {
                  from: "sys-eventos-ingressos",
                  localField: "id2",
                  foreignField: "_id",
                  as: "INGRESSO",
                },
              },
              { $match : { id_evento : id_evento }},       
              
          ])
          .toArray();
      let error = {};
    //   ingressos = {usuarios};
    //   console.log(ingressos);
      if (!ingressos) res.send(error).status(404);
      else res.send(ingressos).status(200);
    });

  router.get("/ingressos/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          { $match : { id_evento : id_evento }},  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3' }},       
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao'}, valor_compra_unitaria:{$sum:"$valor_compra_unitaria"}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-quantidade/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          { $match : { id_evento : id_evento }},       
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3' }},      
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao', "data":'$INGRESSO.data', "limite":'$INGRESSO.limite'}, 
          count:{$count:{}}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });


  router.get("/ingressos-quantidade-limite/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3', id_evento:id_evento }},      
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao', "data":'$INGRESSO.data'}, 
          count:{$count:{}}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-quantidade-limite-promocional/:id_promocional", async (req, res) => {
    let id_promocional = String(req.params.id_promocional);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3' }},      
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao', "data":'$INGRESSO.data'}, 
          count:{$count:{}}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-evento-quantidade/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3', id_evento:id_evento }},      
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao', "data":'$INGRESSO.data', "limite":'$INGRESSO.limite'}, 
          count:{$count:{}}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-evento-gratuito-quantidade/:id_ingresso", async (req, res) => {
    let id_ingresso = String(req.params.id_ingresso);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": id_ingresso } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          {
            "$unwind": "$INGRESSO"
          },
          { $match : { status_compra : '3', id_promocional: {$exists:true} }},      
          {$group : {_id:{"titulo":'$INGRESSO.titulo',"_id":{ "$toObjectId": "$id_ingresso" },"descricao":'$INGRESSO.descricao', "data":'$INGRESSO.data', "limite":'$INGRESSO.limite'}, 
          count:{$count:{}}}},
          {
            $sort:{'_id.descricao':1, '_id.titulo':1 }
          }
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

  router.get("/ingressos-tipo-operacao/:id_evento", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-inscritos");
    let ingressos = {};  
      ingressos = await collection
        .aggregate([ 
          { $addFields: { id2: { "$toObjectId": "$id_ingresso" } } },
          {
            $lookup: {
              from: "sys-eventos-ingressos",
              localField: "id2",
              foreignField: "_id",
              as: "INGRESSO",
            },
          },  
          { $match : { id_evento : id_evento }},   
          {
            "$unwind": "$INGRESSO"
          },  
          { $match : { status_compra : '3' }},    
          {$group : {_id:{"forma_pagamento":'$forma_pagamento',"_id":"$forma_pagamento"},valor_compra_unitaria:{$sum:"$valor_compra_unitaria"},
          count:{$count:{}}}}
        ])
        .toArray();
    let error = {};
  //   ingressos = {usuarios};
  //   console.log(ingressos);
    if (!ingressos) res.send(error).status(404);
    else res.send(ingressos).status(200);
  });

//Recuperar Eventos
router.post("/meus-eventos", async (req, res) => {
    let collection = await db.collection("sys-eventos-inscritos");
    // console.log(req);
    let query = { id_usuario: String(req.body.id_usuario) };
    let eventos = {};
      eventos = await collection
        .aggregate([
          { $match : query },
          { $addFields: { id: { "$toObjectId": "$id_evento" } } },
          {
            $lookup: {
              from: "sys-eventos",
              pipeline: [
                { $match: {
                    $expr: { $and: [
                        { $eq: [ "$tipo_sistema", "sys-escolas" ] },
                        // { $eq: [ "$status_compra", "3" ] }
                    ] }
                } }
              ],
              localField: "id",
              foreignField: "_id",
              as: "JOIN",
            },
          },
          {
            "$unwind": "$JOIN"
          },
          {$group : {_id:
            {
              "titulo":'$JOIN.titulo',
              "_id":{ "$toObjectId": "$id_evento" },
              "descricao":'$JOIN.descricao',
              "data_inicial":'$JOIN.data_inicial',
              "data_final":'$JOIN.data_final',
              "local":'$JOIN.local',
              "local_obs":'$JOIN.local_obs',
              "sigla":'$JOIN.sigla',
              "duracao":'$JOIN.duracao',
              "ativo":'$JOIN.ativo',
              "termino":'$JOIN.termino',
              "image":'$JOIN.image',
            }
          }
        },

        ])
        .toArray();

    let error = {};
    // console.log(eventos);
    if (!eventos) res.send(error).status(404);
    else res.send(eventos.length > 0 ? eventos : eventos).status(200);
  });

  //Alterar Ingresso
router.post("/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $set: { 
      nome: req.body.nome, 
      email: req.body.email, 
      telefone: req.body.telefone, 
      documento: req.body.cpf, 
    }
  }

  // console.log(query);
  // console.log(updates);

  let collection = await db.collection("sys-eventos-inscritos");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});
  
  //Confirmar Ingresso
  router.post("/confirmar/:id", async (req, res) => {
    const query = { _id: ObjectId(req.params.id) };
    let body = req.body;
    // console.log(query);
    // console.log(body);
    const updates = {
      $set: { 
        qr_validado: 'Sim', 
        data_validacao: body.data 
      }
    }
  
    // console.log(query);
    // console.log(updates);
  
    let collection = await db.collection("sys-eventos-inscritos");
    let result = await collection.updateOne(query, updates);
  
    res.send(result).status(200);
  });

  //Confirmar presença
  router.post("/confirmar-presenca/:id", async (req, res) => {
    // const query = { _id: ObjectId(req.params.id) };
    let body = req.body;
    // console.log(req);
    // console.log(body);
    const document = {
      
        id_inscricao: req.params.id,
        id_usuario: body.id_usuario,
        id_evento: body.id_evento,
        id_ingresso: body.id_ingresso,
        titulo: body.titulo,
        nome: body.nome,
        qr_validado: 'Sim', 
        data_validacao: body.data 
    }
  
    // console.log(document);
    // console.log(updates);
    let collection = await db.collection("sys-eventos-inscritos-presenca");
    let result = await collection.insertOne(document);

  
    res.send(result).status(200);
  });

  router.get("/consultar-presenca/:id", async (req, res) => {
    let id_evento = String(req.params.id_evento);
    let collection = await db.collection("sys-eventos-inscritos-presenca");
    let results = await collection.find({})
    // .limit(50)
    .toArray();

    res.send(results).status(200);

  });

  router.get("/consultar-por-cpf/:cpf", async (req, res) => {
    let cpf = String(req.params.cpf);
    let query = { documento: String(cpf), plataforma: 'presencial'};
    // console.log('query',query)
    let collection = await db.collection("sys-eventos-inscritos");
    let result = await collection.find(query).sort({data_compra: -1}).toArray();
    if (result.length > 0) {
    res.send(result).status(200);
    }
    else {
      let query = { documento: String(cpf)};
      let result = await collection.find(query).sort({data_compra: -1}).toArray();
      res.send(result).status(200);
    }
  });

  router.get("/consultar-presenca-todos/:id", async (req, res) => {
    let dados;
    let arr = [];
    let collection = await db.collection("usuarios");
    let id_eventoReq = String(req.params.id);
    let id_eventoOBJ = ObjectId(req.params.id);
    let ingressos = {};
    let usuarios = {};
    // console.log(result.length > 0);
    ingressos = await collection
        .aggregate([
          { $addFields: { id: { "$toString": "$_id" } } },
        //   { $toObjectId: "$id_ingresso" } }
            {
                $lookup: {
                  from: "sys-eventos-inscritos-presenca",
                  let: {
                    id_evento: id_eventoReq,
                  },
                  pipeline: [
                    { $match: {
                        $expr: { $and: [
                            { $eq: [ "$id_evento", "$$id_evento" ] }
                            // { $eq: [ "$status_compra", "3" ] }
                        ] }
                    } }
                  ],
                  localField: "id",
                  foreignField: "id_usuario",
                  as: "USUARIOS",
                },
            },
            {
                $lookup: {
                    from: "sys-eventos-inscritos",
                    let: {
                      id_evento: id_eventoReq
                    },
                    pipeline: [
                      { $match: {
                          $expr: { $and: [
                              { $eq: [ "$status_compra", "3" ] },
                              { $eq: [ "$id_evento", "$$id_evento" ] }
                          ] }
                      } }
                    ],
                    localField: "id",
                    foreignField: "id_usuario",
                    as: "INSCRITOS",
                  },
            },
            {
              $sort:{'nome':1}
            }
        ])
        .toArray();

    let error = {};
  //   ingressos = {usuarios};
  for( const ingresso of ingressos) {
    if (ingresso.INSCRITOS.length > 0) {
        arr.push(ingresso)
        }
  }
  console.log(arr);

    if (!arr) res.send(error).status(404);
    else res.send(arr).status(200);
  });




export default router;
