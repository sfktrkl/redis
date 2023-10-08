import dotenv from "dotenv";
import { createClient } from "redis";

// Generate keys with helper functions to avoid mistakes.
export const itemsKey = (itemId) => `items#${itemId}`;
export const itemsIndexKey = () => "idx:items";

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
    client.on("connect", async () => {
      try {
        await createIndexes();
      } catch (err) {
        console.error(err);
      }
    });
    client.connect();
  }
  return client;
}

export const createIndexes = async () => {
  const indexes = await client.ft._list();
  const exists = indexes.find((index) => index == itemsIndexKey());

  if (exists) {
    return;
  }

  return client.ft.create(
    itemsIndexKey(),
    {
      name: {
        type: "TEXT",
        sortable: true,
      },
      price: {
        type: "NUMERIC",
        sortable: true,
      },
      description: {
        type: "TEXT",
        sortable: false,
      },
    },
    {
      ON: "HASH",
      PREFIX: itemsKey(""),
    }
  );
};

export const createItems = async () => {
  const items = [
    {
      name: "fast car",
      price: 10000,
      description: "It is fast, not much to mention besides that.",
    },
    {
      name: "just car",
      price: 5000,
      description: "It is not a fast car but it is just a car.",
    },
    {
      name: "old car",
      price: 1000,
      description: "It is an old and slow car, probably not the best.",
    },
    {
      name: "new car",
      price: 20000,
      description: "It is a new and fast car, faster than fast car.",
    },
  ];
  console.log("----ITEMS----");
  for (let i = 0; i < items.length; i++) {
    console.log(items[i]);
    await client.hSet(itemsKey(i), items[i]);
  }
};

export const deserialize = (id, value) => {
  return {
    id: id,
    name: value.name,
    price: parseInt(value.price),
    description: value.description,
  };
};
