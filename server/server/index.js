require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Echomind online");
});

app.post("/chat", (req, res) => {

  const { message } = req.body;

  console.log("Mensagem recebida:", message);

  res.json({
    reply: "Echomind recebeu: " + message
  });

});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
   