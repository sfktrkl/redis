import {
  getItem,
  itemIds,
  itemsKey,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";

import { getClient } from "../client.js";
const client = getClient();

// Generate keys with helper functions to avoid mistakes.
export const bidHistoryKey = (itemId) => `history#${itemId}`;

export const createBid = async (bid) => {
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
};

export const getBidHistory = async (itemId, startIndex = 0, endIndex = -1) => {
  const range = await client.lRange(
    bidHistoryKey(itemId),
    startIndex,
    endIndex
  );
  return range.map((bid) => deserialize(itemId, bid));
};

export const serialize = (bid) => {
  return `${bid.amount}|${bid.createdAt.toISOString()}`;
};

export const deserialize = (itemId, bid) => {
  const [amount, createdAt] = bid.split("|");
  return {
    itemId: itemId,
    amount: parseFloat(amount),
    createdAt: new Date(createdAt),
  };
};

async function main() {
  {
    const bid = {
      itemId: -1,
      amount: 25,
      createdAt: new Date(),
    };
    console.log("----BID NO ITEM----");
    console.log(bid);
    await createBid(bid);
    bid.itemId = itemIds[0];
    console.log("----BID NO AMOUNT----");
    console.log(bid);
    await createBid(bid);
    bid.amount = 2025;
    console.log("----BID ITEM----");
    console.log(bid);
    await createBid(bid);
    const item = await getItem(itemIds[0]);
    console.log("----ITEM----");
    console.log(item);
    console.log("----BID ITEM HISTORY----");
    const bidHistory = await getBidHistory(itemIds[0]);
    console.log(bidHistory);
  }

  {
    const bid = {
      itemId: itemIds[1],
      amount: 2500,
      createdAt: new Date(),
    };
    await createBid(bid);
    console.log("----BID OTHER ITEM----");
    console.log(bid);
    const item = await getItem(itemIds[1]);
    console.log("----ITEM----");
    console.log(item);
    console.log("----BID OTHER ITEM HISTORY----");
    const bidHistory = await getBidHistory(itemIds[1]);
    console.log(bidHistory);
  }
}
await main();
