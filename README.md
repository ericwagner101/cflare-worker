# Cloudflare Workers Example 
Basic CloudFlare worker example and test scripts.

## Get started

1. Set up [CloudFlare account](https://dash.cloudflare.com/sign-up/workers-and-pages)
2. Install [nvm](https://docs.npmjs.com/getting-started)
3. Install [Node.js](https://nodejs.org/en/download/package-manager) Use the nvm installer.
4. Run: npm install wrangler --save-dev
5. Run: npx wrangler dev
6. You may need to add wrangler to your path by runing this from within your source checkout dir: source ./setenv.sh (or simply add the path to wrangler in your path.)
7. If you are not already logged in run `npx wrangler login` to login to your Cloudflare account in wrangler
8. Run `npx wrangler deploy` to publish the API to Cloudflare Workers (you do not have to do this immediately as you can use a local dev instance for local development. See Development section below.)

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.

## Development

1. Run `npx wrangler dev` to start a local instance of the API.
2. Run ./api_test_local.sh to test or write your own test to run aginast http://localhost:8787/ 
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.
