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
import sysEventosIngressos from "./routes/sys-eventos-ingressos.mjs";
import sysEventosInscritos from "./routes/sys-eventos-inscritos.mjs";
import sysEventosParcelas from "./routes/sys-eventos-parcelas.mjs";

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
app.use("/sys-eventos-ingressos", sysEventosIngressos );
app.use("/sys-eventos-inscritos", sysEventosInscritos );
app.use("/sys-eventos-parcelas", sysEventosParcelas)


//Email
app.use("/email", email);


// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send(err)
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
