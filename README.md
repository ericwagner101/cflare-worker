# Cloudflare Workers Example 
Basic CloudFlare worker example and test scripts.

## Initial Setup 

1. Set up [CloudFlare account](https://dash.cloudflare.com/sign-up/workers-and-pages)
2. In CloudFlare dashboard [Enable Queues](https://developers.cloudflare.com/queues/get-started/#1-enable-queues)
3. Install [nvm](https://docs.npmjs.com/getting-started)
4. Install [Node.js](https://nodejs.org/en/download/package-manager) Use the nvm installer.

## DB Creation and Setup
1. Create [GCP Cloud SQL PostgreSQL](https://cloud.google.com/sql/docs/postgres) and note the database and connection details. Other databases can be used as well. See [CloudFlare Storage Options](https://developers.cloudflare.com/workers/platform/storage-options/).
2. Set up [Postgres](https://developers.cloudflare.com/hyperdrive/examples/google-cloud-sql/) and note the hyperdrive configuration name created. Add the id to wrangler.toml. Note that the DB related code is already in src/index.ts
3. Create a Postgres table from the psql cli: `CREATE TABLE messages (id serial PRIMARY KEY, messages TEXT);`
4. Add rights psql cli `GRANT INSERT ON messages TO "hyperdrive-user"; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA postgres TO "hyperdrive-user";`

## CloudFlare Wrangler Deploy and Install
1. Run `npm install wrangler --save-dev`
2. Run `npx wrangler dev`
3. You may need to add wrangler to your path by runing `source ./setenv.sh` (or simply add the path to wrangler in your path.)
4. If you are not already logged in run `npx wrangler login` to login to your Cloudflare account in wrangler
5. To create a CloudFlare Queue run `npx wrangler queues create cflare-queue`

## Deploying and Testing
1. Run `npx wrangler deploy` and make sure to copy the deployed https url from the output.
2. Run `npx wrangler tail` to tail worker (and queue).
3. In a separate shell run `./api_test.sh <the_deployed_url` and watch the wrangler tail shell window.
4. To see messages in DB run on psql cli `SELECT * FROM messages;`

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.

## Local Development (not fully tested)

1. Run `npx wrangler dev` to start a local instance of the API.
2. Run `./api_test.sh http://localhost:8787/`
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.
