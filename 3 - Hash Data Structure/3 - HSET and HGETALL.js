import { getClient } from "../client.js";

const client = getClient();
async function main() {
  await client.del("car");
  await client.hSet("car", {
    color: "red",
    year: 1950,
    // can't convert null or undefined to string, hence use empty strings.
    // still not having the property at all or having an empty string as the
    // value of the property may have different meanings.
    service: undefined || "",
    owner: null || "",
  });
  const car = await client.hGetAll("car");
  console.log(car);

  const other = await client.hGetAll("other");
  // although key doesn't exist, it will return an empty object.
  // check the keys of the object to understand the whether the record exists.
  if (Object.keys(other).length === 0) console.log("Record does not exists!");
  console.log(other);
}

main();
