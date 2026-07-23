import express from "express";
import crypto from "crypto";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();
const TOKEN_TTL_SECONDS = 600;
const LIVE_TOKEN_SECRET = process.env.LIVE_TOKEN_SECRET || "ivvcgrj-live-token-local-secret";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
  const signature = crypto.createHmac("sha256", LIVE_TOKEN_SECRET).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  try {
    const expected = crypto.createHmac("sha256", LIVE_TOKEN_SECRET).update(`${header}.${body}`).digest("base64url");
    if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) {
      return null;
    }

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getClientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.ip || req.connection?.remoteAddress || "").split(",")[0].trim();
}

function getDevice(req) {
  return String(req.headers["user-agent"] || "");
}

function getLiveUrl(ingresso) {
  if (ingresso?.link_online?.url) {
    return String(ingresso.link_online.url);
  }

  if (ingresso?.material_online?.tipo === "link" && ingresso.material_online.url) {
    return String(ingresso.material_online.url);
  }

  return "";
}

function getYoutubeEmbedUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  const iframeSrc = value.match(/src=["']([^"']+)["']/i);
  const normalizedValue = iframeSrc?.[1] ? iframeSrc[1] : value;

  try {
    const parsedUrl = new URL(normalizedValue);
    const hostname = parsedUrl.hostname.replace(/^www\./i, "").replace(/^m\./i, "");

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const videoId = parsedUrl.searchParams.get("v")
        || (pathParts[0] === "live" ? pathParts[1] : "")
        || (pathParts[0] === "embed" ? pathParts[1] : "")
        || (pathParts[0] === "shorts" ? pathParts[1] : "");

      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }
  } catch {
    // Mantem compatibilidade com URLs salvas sem protocolo.
  }

  const patterns = [
    /youtube\.com\/watch\?.*[?&]v=([^&]+)/i,
    /youtube\.com\/live\/([^?&/]+)/i,
    /youtube\.com\/embed\/([^?&/]+)/i,
    /youtube\.com\/shorts\/([^?&/]+)/i,
    /youtu\.be\/([^?&/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedValue.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return normalizedValue.includes("youtube.com/embed/") ? normalizedValue : "";
}

function getLiveUrlPublico(idEvento, idIngresso) {
  const params = new URLSearchParams({ id_evento: String(idEvento) });
  if (idIngresso) {
    params.set("id_ingresso", String(idIngresso));
  }
  return `https://verbocampogranderj.com.br/eventos#/live?${params.toString()}`;
}

function getDataEvento(data) {
  if (!data) {
    return null;
  }

  const dataEvento = new Date(data);
  dataEvento.setHours(dataEvento.getHours() + 3);
  return dataEvento;
}

function getEventStatus(evento) {
  const now = new Date();
  const startAt = getDataEvento(evento?.data_inicial);
  const endAt = getDataEvento(evento?.data_final);

  if (startAt && now < startAt) {
    return { status: "not_started", start_at: startAt };
  }

  if (endAt && now > endAt) {
    return { status: "ended", end_at: endAt };
  }

  return { status: "active", start_at: startAt, end_at: endAt };
}

async function getLiveAccessData({ id_usuario, id_evento, id_ingresso }) {
  if (!ObjectId.isValid(id_evento)) {
    return { statusCode: 400, error: "Evento inválido." };
  }

  const inscricoesCollection = await db.collection("sys-eventos-inscritos");
  const eventosCollection = await db.collection("sys-eventos");
  const evento = await eventosCollection.findOne({ _id: ObjectId(id_evento) });
  if (!evento) {
    return { statusCode: 404, error: "Evento não encontrado." };
  }

  const match = {
    id_usuario: String(id_usuario),
    id_evento: String(id_evento),
    status_compra: { $in: ["3", 3] },
  };

  if (id_ingresso) {
    match.id_ingresso = String(id_ingresso);
  }

  const inscricoes = await inscricoesCollection
    .aggregate([
      { $match: match },
      {
        $addFields: {
          id_ingresso_obj: {
            $convert: {
              input: "$id_ingresso",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: { id_ingresso_obj: { $ne: null } } },
      {
        $lookup: {
          from: "sys-eventos-ingressos",
          localField: "id_ingresso_obj",
          foreignField: "_id",
          as: "INGRESSO",
        },
      },
      { $unwind: "$INGRESSO" },
    ])
    .toArray();

  const inscricao = inscricoes.find((item) => item.INGRESSO?.tipo_online === "online" && getLiveUrl(item.INGRESSO));
  if (!inscricao) {
    return { statusCode: 403, error: "Nenhum ingresso online aprovado foi encontrado para este evento." };
  }

  const embedUrl = getYoutubeEmbedUrl(getLiveUrl(inscricao.INGRESSO));
  if (!embedUrl) {
    return { statusCode: 403, error: "Transmissão não configurada para este ingresso." };
  }

  return {
    statusCode: 200,
    evento,
    inscricao,
    ingresso: inscricao.INGRESSO,
    embedUrl,
    liveUrlPublico: getLiveUrlPublico(id_evento, inscricao.id_ingresso),
  };
}

router.post("/access", async (req, res) => {
  const { id_usuario, id_evento, id_ingresso } = req.body || {};
  if (!id_usuario || !id_evento) {
    res.status(401).send({ status: "unauthorized", message: "Usuário autenticado e evento são obrigatórios." });
    return;
  }

  const data = await getLiveAccessData({ id_usuario, id_evento, id_ingresso });
  if (data.statusCode !== 200) {
    res.status(data.statusCode).send({ status: "forbidden", message: data.error });
    return;
  }

  const eventStatus = getEventStatus(data.evento);
  if (eventStatus.status !== "active") {
    res.status(200).send({
      status: eventStatus.status,
      start_at: eventStatus.start_at,
      end_at: eventStatus.end_at,
      message: eventStatus.status === "not_started" ? "A transmissão iniciará em breve." : "Evento encerrado.",
    });
    return;
  }

  const sessionsCollection = await db.collection("live_sessions");
  const sessionBase = {
    usuario: String(id_usuario),
    inscricao_id: String(data.inscricao._id),
  };

  await sessionsCollection.updateMany(
    { ...sessionBase, status: "active" },
    { $set: { status: "closed", closed_at: new Date(), closed_reason: "new_session" } }
  );

  const session = {
    ...sessionBase,
    evento: String(id_evento),
    ingresso: String(data.inscricao.id_ingresso),
    ip: getClientIp(req),
    device: getDevice(req),
    created_at: new Date(),
    last_access: new Date(),
    status: "active",
  };
  const result = await sessionsCollection.insertOne(session);
  const token = createToken({
    evento: String(id_evento),
    usuario: String(id_usuario),
    email: data.inscricao.email,
    inscricao_id: String(data.inscricao._id),
    session_id: String(result.insertedId),
  });

  await db.collection("live_access_logs").insertOne({
    usuario: String(id_usuario),
    evento: String(id_evento),
    inscricao_id: String(data.inscricao._id),
    session_id: String(result.insertedId),
    action: "access_granted",
    ip: getClientIp(req),
    device: getDevice(req),
    created_at: new Date(),
  });

  res.status(200).send({
    status: "active",
    token,
    expires_in: TOKEN_TTL_SECONDS,
    session_id: String(result.insertedId),
    participant: {
      nome: data.inscricao.nome,
      email: data.inscricao.email,
    },
  });
});

router.post("/player", async (req, res) => {
  const payload = verifyToken(req.body?.token);
  if (!payload) {
    res.status(401).send({ status: "unauthorized", message: "Sessão expirada." });
    return;
  }

  if (!ObjectId.isValid(payload.session_id)) {
    res.status(401).send({ status: "unauthorized", message: "Sessão inválida." });
    return;
  }

  const session = await db.collection("live_sessions").findOne({
    _id: ObjectId(payload.session_id),
    status: "active",
  });
  if (!session) {
    res.status(403).send({ status: "forbidden", message: "Sessão encerrada." });
    return;
  }

  const data = await getLiveAccessData({
    id_usuario: payload.usuario,
    id_evento: payload.evento,
    id_ingresso: session.ingresso,
  });
  if (data.statusCode !== 200) {
    res.status(data.statusCode).send({ status: "forbidden", message: data.error });
    return;
  }

  res.status(200).send({
    status: "active",
    embed_url: data.embedUrl,
    participant: {
      nome: data.inscricao.nome,
      email: data.inscricao.email,
    },
  });
});

router.post("/heartbeat", async (req, res) => {
  const payload = verifyToken(req.body?.token);
  if (!payload) {
    res.status(401).send({ status: "unauthorized", message: "Sessão expirada." });
    return;
  }

  if (!ObjectId.isValid(payload.session_id)) {
    res.status(401).send({ status: "unauthorized", message: "Sessão inválida." });
    return;
  }

  const result = await db.collection("live_sessions").updateOne(
    { _id: ObjectId(payload.session_id), status: "active" },
    { $set: { last_access: new Date(), ip: getClientIp(req), device: getDevice(req) } }
  );

  if (result.matchedCount === 0) {
    res.status(403).send({ status: "forbidden", message: "Sessão encerrada." });
    return;
  }

  const token = createToken({
    evento: String(payload.evento),
    usuario: String(payload.usuario),
    email: payload.email,
    inscricao_id: String(payload.inscricao_id),
    session_id: String(payload.session_id),
  });

  await db.collection("live_access_logs").insertOne({
    usuario: payload.usuario,
    evento: payload.evento,
    inscricao_id: payload.inscricao_id,
    session_id: payload.session_id,
    action: "heartbeat",
    ip: getClientIp(req),
    device: getDevice(req),
    created_at: new Date(),
  });

  res.status(200).send({ status: "active", token, expires_in: TOKEN_TTL_SECONDS });
});

router.post("/logout", async (req, res) => {
  const payload = verifyToken(req.body?.token);
  if (!payload) {
    res.status(200).send({ status: "closed" });
    return;
  }

  if (!ObjectId.isValid(payload.session_id)) {
    res.status(200).send({ status: "closed" });
    return;
  }

  await db.collection("live_sessions").updateOne(
    { _id: ObjectId(payload.session_id) },
    { $set: { status: "closed", closed_at: new Date(), closed_reason: "logout" } }
  );

  res.status(200).send({ status: "closed" });
});

export default router;
