import {
  itemIds,
  itemsKey,
  deserialize,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";
import {
  viewItem,
  itemViewCount,
  itemsByViewsKey,
} from "../5 - Sorted Set Data Structure/E - Sorted Set Exercises.js";

import { getClient } from "../client.js";
const client = getClient();

export const itemsByViews = async (order = "DESC", offset = 0, count = 10) => {
  let results = await client.sort(itemsByViewsKey(), {
    GET: [
      "#",
      `${itemsKey("*")}->name`,
      `${itemsKey("*")}->description`,
      `${itemsKey("*")}->price`,
      `${itemsKey("*")}->createdAt`,
      `${itemsKey("*")}->views`,
    ],
    BY: "nosort",
    DIRECTION: order,
    LIMIT: {
      offset,
      count,
    },
  });

  const items = [];
  while (results.length) {
    const [id, name, description, price, createdAt, views, ...rest] = results;
    const item = deserialize(id, {
      name,
      description,
      price,
      createdAt,
    });
    item.views = parseInt(views);
    items.push(item);
    results = rest;
  }

  return items;
};

async function main() {
  {
    for (let i = 0; i < 5; i++) await viewItem(itemIds[1]);
    const viewCount = await itemViewCount(itemIds[1]);
    console.log("----OTHER ITEM VIEWS----");
    console.log(viewCount);
    const mostViewedItems = await itemsByViews();
    console.log("----MOST VIEWED ITEMS----");
    console.log(mostViewedItems);
  }
}
await main();
