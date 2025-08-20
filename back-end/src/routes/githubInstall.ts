import { Router } from "express";
import { Installation } from "../models/Installation.js";

export const githubInstallRouter = Router();

// Ex.: https://your-api/install/github?installation_id=123456&setup_action=installed
githubInstallRouter.get("/", async (req, res) => {
  const installationId = Number(req.query.installation_id);
  const setupAction = String(req.query.setup_action || "");

  if (!installationId) return res.status(400).send("missing installation_id");

  // opcional: chame /app/installations/{id} para enriquecer dados
  // aqui só persistimos o id; o webhook de "installation" também chega
  await Installation.findOneAndUpdate(
    { installationId },
    { $setOnInsert: { installationId } },
    { upsert: true, new: true }
  );

  // redirecione para o front (ex.: selecionar repositórios, etc.)
  return res.redirect(
    `http://localhost:5173/integrations/github?installed=${setupAction}&installation=${installationId}`
  );
});
