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

import { getClient } from "../client.js";
const client = getClient();

export const pause = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

export const withLock = async (key, callback) => {
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
      const result = await callback();
      return result;
    } finally {
      await client.del(lockKey);
    }
  }
};

export const createBidLock = async (bid) => {
  return withLock(bid.itemId, async () => {
    const item = await getItem(bid.itemId);

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

async function main() {
  const bid = {
    itemId: -1,
    amount: 5000,
    createdAt: new Date(),
  };

  {
    const commands = [];
    bid.itemId = itemIds[1];
    console.log("----BID OTHER ITEM HISTORY----");
    for (let i = 0; i < 5; i++) {
      bid.amount += 1000;
      commands.push(createBidLock(structuredClone(bid)));
    }
    await Promise.all(commands);
    const bidHistory = await getBidHistory(bid.itemId);
    console.log(bidHistory);
  }
}
await main();
