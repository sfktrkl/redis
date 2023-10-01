# Redis

## Create an instance on Redis Cloud

- Go to redis.com
- Try free and sign up
- Create a new database

It is ready, we will need endpoint and the password in the Edit menu.

## Run Redis Commands

- Install nodejs

```bash
sudo apt update
sudo apt install nodejs
```

- Install and run rbook

```bash
npx rbook
```

## Run sandbox

- Install sandbox

```bash
npm install
```

- Define environment variables in `.env`

```
REDIS_HOST=YOUR_REDIS_CLOUD_HOST_URL_FROM_PUBLIC_ENDPOINT
REDIS_PORT=YOUR_REDIS_CLOUD_HOST_PORT_FROM_PUBLIC_ENDPOINT
REDIS_PW=YOUR_REDIS_CLOUD_DEFAULT_USER_PASSWORD
```

- Import `client.js` to get the client and set the `.env` location.

```js
// example.js
import { getClient } from "../client.js";

async function main() {
  const client = getClient(/* '../.env' */);
  // YOUR CODE
}
main();
```

- Run the script

```bash
node example.js
```
