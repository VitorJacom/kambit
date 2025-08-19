// src/server.ts
import { createApp } from "./app.js";
import { config } from "./config.js";

const app = await createApp();
app.listen(config.port, () => {
  console.log(`Kambit API rodando na porta ${config.port}`);
});
