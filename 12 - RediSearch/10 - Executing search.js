import {
  getClient,
  createItems,
  deserialize,
  itemsIndexKey,
} from "./9 - Create index.js";
const client = getClient();

export const searchItems = async (term, size = 5) => {
  const cleaned = term
    .replaceAll(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(" ")
    .map((word) => (word ? `%${word}%` : ""))
    .join(" ");

  if (cleaned === "") return [];

  const results = await client.ft.search(itemsIndexKey(), cleaned, {
    LIMIT: {
      from: 0,
      size,
    },
  });

  return results.documents.map(({ id, value }) => {
    return deserialize(id, value);
  });
};

async function main() {
  await createItems();
  console.log("----SEARCH ITEMS----");
  console.log(await searchItems("fast car"));
}
await main();
