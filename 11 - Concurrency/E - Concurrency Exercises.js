import dotenv from "dotenv";
import { createClient, defineScript } from "redis";
dotenv.config({ path: "../.env" });

import {
  getItem,
  itemIds,
  itemsKey,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";
import {
  serialize,
  getBidHistory,
  bidHistoryKey,
} from "../8 - List Data Structure/E - List Exercises.js";
import { pause } from "./1 - Implementing lock.js";

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PW,
  scripts: {
    unlock: defineScript({
      NUMBER_OF_KEYS: 1,
      SCRIPT: `
              if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
              end
              `,
      transformArguments(key, token) {
        return [key, token];
      },
      transformReply(reply) {
        return reply;
      },
    }),
  },
});

export const buildClientProxy = (timeoutMs) => {
  const startTime = Date.now();

  const handler = {
    get(target, prop) {
      if (Date.now() >= startTime + timeoutMs) {
        throw new Error("Lock has expired.");
      }

      const value = target[prop];
      return typeof value === "function" ? value.bind(target) : value;
    },
  };

  return new Proxy(client, handler);
};

export const withLockProxy = async (key, callback) => {
  const retryDelayMs = 100;
  let retries = 200;

  const token = "locked";
  const lockKey = `lock:${key}`;

  while (retries >= 0) {
    retries--;
    const acquired = await client.set(lockKey, token, {
      NX: true,
      PX: 2000,
    });

    if (!acquired) {
      await pause(retryDelayMs);
      continue;
    }

    try {
      const proxiedClient = buildClientProxy(200);
      const result = await callback(proxiedClient);
      return result;
    } finally {
      await client.unlock(lockKey, token);
    }
  }
};

export const createBidProxy = async (bid) => {
  return withLockProxy(bid.itemId, async (client) => {
    const item = await getItem(bid.itemId);
    // Fake pause, some heavy duty processing
    await pause(200);

    if (!item) {
      console.log("Item does not exist");
      return;
    }
    if (item.price >= bid.amount) {
      console.log("Bid too low");
      return;
    }

    return await Promise.all([
      client.rPush(bidHistoryKey(bid.itemId), serialize(bid)),
      client.hIncrBy(itemsKey(bid.itemId), "price", bid.amount - item.price),
    ]);
  });
};

client.on("error", (err) => console.error(err));
client.connect();

async function main() {
  const bid = {
    itemId: -1,
    amount: 50000,
    createdAt: new Date(),
  };

  {
    const commands = [];
    bid.itemId = itemIds[1];
    console.log("----BID OTHER ITEM HISTORY----");
    for (let i = 0; i < 5; i++) {
      bid.amount += 1000;
      commands.push(createBidProxy(structuredClone(bid)));
    }
    await Promise.all(commands);
    const bidHistory = await getBidHistory(bid.itemId);
    console.log(bidHistory);
  }
}
await main();
