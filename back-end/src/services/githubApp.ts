import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const GH_API = "https://api.github.com";

function makeAppJwt(): string {
  // exp curto (máx 10 min). Aqui usamos 60s.
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // 1 min atrás (clock skew)
    exp: now + 60, // 1 min adiante
    iss: Number(config.github.appId), // App ID NUMÉRICO
  };
  return jwt.sign(payload, config.github.privateKeyPem, { algorithm: "RS256" });
}

export async function getInstallationToken(
  installationId: number
): Promise<string> {
  const appJwt = makeAppJwt();
  const res = await fetch(
    `${GH_API}/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`fail create installation token: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.token; // válido ~1h
}

// Utilidade: criar branch (cria um novo ref) a partir de um base ref/sha
export async function createBranch(
  installationToken: string,
  owner: string,
  repo: string,
  newBranch: string,
  baseRef = "main"
) {
  // 1) obter o SHA do baseRef
  const h = {
    Authorization: `Bearer ${installationToken}`,
    Accept: "application/vnd.github+json",
  };
  const refRes = await fetch(
    `${GH_API}/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(
      baseRef
    )}`,
    { headers: h }
  );
  if (!refRes.ok) throw new Error(`base ref not found: ${baseRef}`);
  const refJson = await refRes.json();
  const sha: string = refJson.object.sha;

  // 2) criar o ref
  const body = { ref: `refs/heads/${newBranch}`, sha };
  const crtRes = await fetch(`${GH_API}/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!crtRes.ok) {
    const t = await crtRes.text();
    throw new Error(`failed to create branch: ${crtRes.status} ${t}`);
  }
  return await crtRes.json();
}
