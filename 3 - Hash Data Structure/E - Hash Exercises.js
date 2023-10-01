import { getClient } from "../client.js";
const client = getClient();

// Generate keys with helper functions to avoid mistakes.
export const itemsKey = (itemId) => `items#${itemId}`;

export const saveItem = async (item) => {
  return await client.hSet(itemsKey(item.id), serialize(item));
};

// Gets an object ready to go into Redis
// - Removes id (to decrease the use of memory)
// - Turns dates into a queryable format
export const serialize = (item) => {
  return {
    name: item.name,
    description: item.description,
    price: item.price,
    createdAt: item.createdAt.toISOString(),
  };
};

export const getItem = async (itemId) => {
  const item = await client.hGetAll(itemsKey(itemId));
  if (Object.keys(item).length === 0) return null;
  return deserialize(itemId, item);
};

// Formats data coming out of Redis
// - Adds the id
// - Parse string numbers into plain numbers
// - Formats any other information like dates
export const deserialize = (itemId, item) => {
  return {
    id: itemId,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price),
    createdAt: new Date(item.createdAt),
  };
};

export const getItems = async (itemIds) => {
  const commands = itemIds.map((id) => {
    return client.hGetAll(itemsKey(id));
  });

  const results = await Promise.all(commands);

  return results.map((result, i) => {
    if (Object.keys(result).length === 0) return null;
    return deserialize(itemIds[i], result);
  });
};

async function main() {
  const itemIds = [
    Math.floor(Math.random() * 1000).toString(),
    Math.floor(Math.random() * 1000).toString(),
  ];

  {
    const item = {
      id: itemIds[0],
      name: "Example item",
      description: "Some string that describes the item",
      price: 2023,
      createdAt: new Date(),
    };
    await saveItem(item);
    console.log("----ITEM----");
    console.log(item);
  }

  {
    const response = await getItem(itemIds[0]);
    console.log("----RESPONSE----");
    console.log(response);
  }

  {
    const item = {
      id: itemIds[1],
      name: "Another example item",
      description: "Some string that describes the other item",
      price: 2023,
      createdAt: new Date(),
    };
    await saveItem(item);
    console.log("----OTHER ITEM----");
    console.log(item);
  }

  {
    const response = await getItems(itemIds);
    console.log("----RESPONSE ITEMS----");
    console.log(response);
  }

  return itemIds;
}
const itemIds = await main();
export { itemIds };
