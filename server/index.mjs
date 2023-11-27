import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import "express-async-errors";
import secoes from "./routes/secoes.mjs";
import produtos from "./routes/produtos.mjs";
import pedidos from "./routes/pedidos.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

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
