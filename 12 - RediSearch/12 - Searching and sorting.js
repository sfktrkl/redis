import {
  getClient,
  createItems,
  deserialize,
  itemsIndexKey,
} from "./9 - Create index.js";
const client = getClient();

export const itemsByPrice = async (term, opts) => {
  const cleaned = term
    .replaceAll(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(" ")
    .map((word) => (word ? `%${word}%` : ""))
    .join(" ");

  const query = `(@name:(${cleaned}) => { $weight: 5.0 }) | (@description:(${cleaned}))`;

  const sortCriteria = opts.sortBy &&
    opts.direction && {
      BY: opts.sortBy,
      DIRECTION: opts.direction,
    };

  const { total, documents } = await client.ft.search(itemsIndexKey(), query, {
    ON: "HASH",
    SORTBY: sortCriteria,
    LIMIT: {
      from: opts.page * opts.perPage,
      size: opts.perPage,
    },
  });

  return {
    totalPages: Math.ceil(total / opts.perPage),
    items: documents.map(({ id, value }) => {
      return deserialize(id, value);
    }),
  };
};

async function main() {
  await createItems();
  console.log("----ITEMS BY PRICE----");
  console.log(
    await itemsByPrice("fast car", {
      sortBy: "price",
      direction: "DESC",
      page: 0,
      perPage: 2,
    })
  );
}
await main();
