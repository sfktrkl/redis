import {
  getItem,
  itemIds,
  itemsKey,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";
import {
  serialize,
  createBid,
  getBidHistory,
  bidHistoryKey,
} from "../8 - List Data Structure/E - List Exercises.js";

import { getClient } from "../client.js";
const client = getClient();

export const createBidTransaction = async (bid) => {
  return client.executeIsolated(async (isolatedClient) => {
    await isolatedClient.watch(itemsKey(bid.itemId));
    const item = await getItem(bid.itemId);

    if (!item) {
      console.log("Item does not exist");
      return;
    }
    if (item.price >= bid.amount) {
      console.log("Bid too low");
      return;
    }

    return isolatedClient
      .multi()
      .rPush(bidHistoryKey(bid.itemId), serialize(bid))
      .hIncrBy(itemsKey(bid.itemId), "price", bid.amount - item.price)
      .exec();
  });
};

async function main() {
  const bid = {
    itemId: -1,
    amount: 2500,
    createdAt: new Date(),
  };
  console.log("----BID----");
  console.log(bid);

  {
    const commands = [];
    bid.itemId = itemIds[0];
    console.log("----BID ITEM HISTORY----");
    for (let i = 0; i < 5; i++) commands.push(createBid(bid));
    await Promise.all(commands);
    const bidHistory = await getBidHistory(bid.itemId);
    console.log(bidHistory);
  }

  {
    const commands = [];
    bid.itemId = itemIds[1];
    console.log("----BID OTHER ITEM HISTORY----");
    for (let i = 0; i < 5; i++) commands.push(createBidTransaction(bid));
    await Promise.all(commands);
    const bidHistory = await getBidHistory(bid.itemId);
    console.log(bidHistory);
  }
}
await main();
