import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import "express-async-errors";
import usuarios from "./routes/usuarios.mjs";
import departamentos from "./routes/departamentos.mjs";
import departamentosFuncoes from "./routes/departamentos-funcoes.mjs";
import discipulados from "./routes/discipulados.mjs";
import rhema from "./routes/rhema.mjs";
import email from "./routes/email.mjs";
import visitantes from "./routes/visitantes.mjs";
import calendarioEventos from "./routes/calendarios-eventos.mjs";
import eventos from "./routes/eventos.mjs";
import sysEventos from "./routes/sys-eventos.mjs";
import sysEventosUsuarios from "./routes/sys-eventos-usuarios.mjs";
import sysEventosIngressos from "./routes/sys-eventos-ingressos.mjs";
import sysEventosIngressosPrivados from "./routes/sys-eventos-ingressos-privados.mjs";
import sysEventosInscritos from "./routes/sys-eventos-inscritos.mjs";
import sysEventosParcelas from "./routes/sys-eventos-parcelas.mjs";
import sysEventosCompraCartao from "./routes/sys-eventos-compra-cartao.mjs";
import sysEventosCompraGratuita from "./routes/sys-eventos-compra-gratuita.mjs";
import sysEventosCompraPromocionalCartao from "./routes/sys-eventos-compra-promocional-cartao.mjs";
import sysEventosCompraPix from "./routes/sys-eventos-compra-pix.mjs";
import sysEventosCompraPromocionalPix from "./routes/sys-eventos-compra-promocional-pix.mjs";
import sysEventosCompraCartaoPresencial from "./routes/sys-eventos-compra-cartao-presencial.mjs";
import sysEventosNotificacoes from "./routes/sys-eventos-notificacoes.mjs";
import sysEventosDuvidas from "./routes/sys-eventos-duvidas.mjs";
import sysEventosCadeirasLayout from "./routes/sys-eventos-cadeiras-layout.mjs";
import sysEventosFileirasLayout from "./routes/sys-eventos-fileiras-layout.mjs";

import secoes from "./routes/secoes.mjs";
import produtos from "./routes/produtos.mjs";
import pedidos from "./routes/pedidos.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Usuários
app.use("/usuarios", usuarios);
// Usuários
app.use("/visitantes", visitantes);
// Departamentos
app.use("/departamentos", departamentos);
// Departamentos
app.use("/departamentos-funcoes", departamentosFuncoes);
// Discipulados
app.use("/discipulados", discipulados);
// Rhema
app.use("/rhema", rhema);
// Eventos
app.use("/eventos", eventos );
// Calendarios Eventos
app.use("/calendarios-eventos", calendarioEventos );


// Sys Eventos
app.use("/sys-eventos", sysEventos );
app.use("/sys-eventos-usuarios", sysEventosUsuarios );
app.use("/sys-eventos-ingressos", sysEventosIngressos );
app.use("/sys-eventos-ingressos-privados", sysEventosIngressosPrivados );
app.use("/sys-eventos-inscritos", sysEventosInscritos );
app.use("/sys-eventos-parcelas", sysEventosParcelas);
app.use("/sys-eventos-compra-cartao", sysEventosCompraCartao);
app.use("/sys-eventos-compra-promocional-cartao", sysEventosCompraPromocionalCartao);
app.use("/sys-eventos-compra-gratuita", sysEventosCompraGratuita);
app.use("/sys-eventos-compra-pix", sysEventosCompraPix);
app.use("/sys-eventos-compra-promocional-pix", sysEventosCompraPromocionalPix);
app.use("/sys-eventos-compra-cartao-presencial", sysEventosCompraCartaoPresencial);
app.use("/sys-eventos-notificacoes", sysEventosNotificacoes);
app.use("/sys-eventos-duvidas", sysEventosDuvidas);
app.use("/sys-eventos-cadeiras-layout", sysEventosCadeirasLayout);
app.use("/sys-eventos-fileiras-layout", sysEventosFileirasLayout);


//Email
app.use("/email", email);


// secoes
app.use("/secoes", secoes);
// produtos
app.use("/produtos", produtos);
// pedidos
app.use("/pedidos", pedidos);


// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send(err)
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
