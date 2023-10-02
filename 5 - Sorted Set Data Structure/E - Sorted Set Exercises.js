import {
  itemIds,
  itemsKey,
  getItem,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";

import { getClient } from "../client.js";
const client = getClient();

// Generate keys with helper functions to avoid mistakes.
export const itemsByViewsKey = () => `items:views`;

export const viewItem = async (itemId) => {
  return await Promise.all([
    client.hIncrBy(itemsKey(itemId), "views", 1),
    client.zIncrBy(itemsByViewsKey(), 1, itemId),
  ]);
};

export const itemViewCount = async (itemId) => {
  const views = await client.zScore(itemsByViewsKey(), itemId);
  if (!views) return 0;
  return parseInt(views);
};

export const viewedItems = async (offset = 0, count = 5) => {
  const results = await client.zRangeByScoreWithScores(
    itemsByViewsKey(),
    "-inf",
    "+inf",
    {
      LIMIT: {
        offset,
        count,
      },
    }
  );
  return await Promise.all(
    results.map(async (result) => {
      const item = await getItem(result.value);
      item.views = result.score;
      return item;
    })
  );
};

async function main() {
  {
    await viewItem(itemIds[0]);
    console.log("----ITEM VIEWS----");
    const item = await client.hGetAll(itemsKey(itemIds[0]));
    console.log(item.views);
    console.log("----ITEM VIEW COUNT----");
    const viewCount = await itemViewCount(itemIds[0]);
    console.log(viewCount);
  }

  {
    console.log("----OTHER ITEM VIEWS----");
    const item = await client.hGetAll(itemsKey(itemIds[1]));
    console.log(item.views ?? 0);
    console.log("----OTHER ITEM VIEW COUNT----");
    const viewCount = await itemViewCount(itemIds[1]);
    console.log(viewCount);
  }

  {
    const viewed = await viewedItems();
    console.log("----VIEWED ITEMS----");
    console.log(viewed);
  }
}
await main();
