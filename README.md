# Cloudflare Workers Example 
Basic CloudFlare worker example and test scripts.

## Get started

1. Set up [CloudFlare with Queues enabled](https://developers.cloudflare.com/queues/get-started/)
2. You may need to add wrangler to your path by runing this from within your source checkout dir: source ./setenv.sh (or simply add the path to wrangler in your path.)
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. Run `wrangler deploy` to publish the API to Cloudflare Workers

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. For more information read the [chanfana documentation](https://chanfana.pages.dev/) and [Hono documentation](https://hono.dev/docs).

## Development

1. Run `wrangler dev` to start a local instance of the API.
2. Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.
