function html(error, from) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EchoMind</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B0C10;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .card {
      background: #13141A;
      border: 1px solid #1e1f28;
      border-radius: 20px;
      padding: 48px 40px;
      width: 100%;
      max-width: 380px;
      text-align: center;
    }
    .orb {
      width: 72px; height: 72px; border-radius: 50%;
      background: #6C63FF;
      box-shadow: 0 0 40px rgba(108,99,255,0.5);
      margin: 0 auto 24px;
    }
    h1 { color: #fff; font-size: 24px; font-weight: 600; margin-bottom: 6px; }
    p  { color: #666; font-size: 14px; margin-bottom: 32px; }
    input {
      width: 100%;
      background: #1a1b22;
      border: 1px solid #2a2b35;
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      padding: 14px 16px;
      margin-bottom: 16px;
      outline: none;
      transition: border-color .2s;
    }
    input:focus { border-color: #6C63FF; }
    button {
      width: 100%;
      background: #6C63FF;
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      padding: 14px;
      cursor: pointer;
      transition: opacity .2s;
    }
    button:hover { opacity: .85; }
    .error { color: #FF4D4D; font-size: 13px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="orb"></div>
    <h1>EchoMind</h1>
    <p>Acesso restrito</p>
    ${error ? `<div class="error">${error}</div>` : ""}
    <form method="POST" action="/api/login">
      <input type="hidden" name="from" value="${from || "/"}" />
      <input type="password" name="password" placeholder="Senha" autofocus />
      <button type="submit">Entrar</button>
    </form>
  </div>
</body>
</html>`;
}

async function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      resolve({
        password: params.get("password") || "",
        from: params.get("from") || "/",
      });
    });
  });
}

module.exports = async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || "echomind2025";
  const adminToken = process.env.ADMIN_TOKEN || "echomind_token_secret";

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (req.method === "GET") {
    const from = req.query?.from || "/";
    return res.status(200).send(html("", from));
  }

  if (req.method === "POST") {
    const { password, from } = await readBody(req);

    if (password !== adminPassword) {
      return res.status(401).send(html("Senha incorreta.", from));
    }

    const maxAge = 60 * 60 * 24 * 7; // 7 dias
    res.setHeader(
      "Set-Cookie",
      `echomind_token=${adminToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`
    );
    res.writeHead(302, { Location: from || "/" });
    return res.end();
  }

  res.status(405).send("Method not allowed");
};
