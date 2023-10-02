import {
  itemIds,
  itemsKey,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";
import { userIds } from "../4 - Set Data Structure/E - Set Exercises.js";

import { getClient } from "../client.js";
const client = getClient();

// Generate keys with helper functions to avoid mistakes.
export const itemsBySubsKey = () => `items:subs`;
export const itemsSubsKey = (itemId) => `items:subs#${itemId}`;

export const subItem = async (itemId, userId) => {
  const subscribed = await client.pfAdd(itemsSubsKey(itemId), userId);
  if (subscribed) {
    return await Promise.all([
      client.hIncrBy(itemsKey(itemId), "subs", 1),
      client.zIncrBy(itemsBySubsKey(), 1, itemId),
    ]);
  }
};

export const itemSubCount = async (itemId) => {
  const views = await client.zScore(itemsBySubsKey(), itemId);
  if (!views) return 0;
  return parseInt(views);
};

async function main() {
  {
    for (let i = 0; i < 5; i++) await subItem(itemIds[0], userIds[0]);
    for (let i = 0; i < 5; i++) await subItem(itemIds[0], userIds[1]);
    console.log("----ITEM SUB COUNT----");
    const viewCount = await itemSubCount(itemIds[0]);
    console.log(viewCount);
  }

  {
    for (let i = 0; i < 5; i++) await subItem(itemIds[1], userIds[0]);
    console.log("----OTHER ITEM SUB COUNT----");
    const viewCount = await itemSubCount(itemIds[1]);
    console.log(viewCount);
  }
}
await main();
