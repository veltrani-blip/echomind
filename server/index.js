const db = require('./server/db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
console.log("CHAT RECEBIDO:", req.body);

try {
const { message } = req.body;

const response = await axios.post(
"https://api.openai.com/v1/chat/completions",
{
model: "gpt-4o-mini",
messages: [
{
role: "system",
content:
"Você é Echomind, uma terapeuta virtual não clínica. Sua personalidade é feminina, calma, empática e acolhedora. Você fala de forma suave, clara e segura. Você utiliza princípios de TCC e atenção plena. Você nunca diagnostica. Você nunca substitui terapia profissional. Se identificar risco de dano ao usuário ou a terceiros, interrompa a conversa e recomende ajuda profissional imediatamente. Sempre faça perguntas abertas antes de oferecer sugestões.",
},
{ role: "user", content: message },
],
},
{
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
},
}
);

return res.json({ reply: response.data.choices[0].message.content });
} catch (err) {
console.log("ERRO CHAT:", err.response?.data || err.message);
return res.status(400).json({ error: err.message });
}
});
  

app.listen(3001, '0.0.0.0', () => {
  console.log("Servidor rodando na porta 3001");
});