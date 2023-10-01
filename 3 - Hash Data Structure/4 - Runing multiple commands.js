import { getClient } from "../client.js";

const client = getClient();
async function main() {
  const ids = [0, 1, 2, 3, 4];
  const commands = ids.map((id) => {
    return client.del("car" + id);
  });
  await Promise.all(commands);

  await client.hSet("car0", { color: "red" });
  await client.hSet("car2", { color: "blue" });
  await client.hSet("car4", { color: "green" });

  // Pipelining in most Redis clients,
  // client = redis.Redis(...)
  // pipe = client.pipeline()
  // pipe.set('foo', 'bar')
  // pipe.get('bing')
  // pipe.execute()

  {
    const results = await Promise.all([
      client.hGetAll("car0"),
      client.hGetAll("car2"),
      client.hGetAll("car4"),
    ]);
    console.log(results);
  }

  {
    const commands = ids.map((id) => {
      return client.hGetAll("car" + id);
    });
    const results = await Promise.all(commands);
    console.log(results);

    const cars = results.map((result, i) => {
      if (Object.keys(result).length === 0) return null;
      return { id: i, color: result.color };
    });
    console.log(cars);
  }
}

main();
