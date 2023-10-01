import dotenv from "dotenv";
import { createClient } from "redis";

let client = null;
export function getClient(envPath = "../.env") {
  if (!client) {
    dotenv.config({ path: envPath });
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
      password: process.env.REDIS_PW,
    });

    client.on("error", (err) => console.error(err));
    client.connect();
  }
  return client;
}
