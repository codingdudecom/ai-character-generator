# AI Character Generator
Easy-to-use AI character generator that can be integrated in any app. It's based on Cloudflare Workers AI

# How to install

First create a Wrangler project for making a Cloudflare Worker. Follow [this guide](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/), which in short means:

1. Create a NodeJS project from the Cloudflare Workers template:

```
npm create cloudflare@latest
```

Input a name for your project (eg. ai-character-generator) and check `Yes` for everthing except for deployment. We will do that later.

2. Go into the project folder created and find the `wrangler.toml` file. You need to activate the Workers AI for Cloudflare feature.

```
cd ai-character-generator
```

In `wrangler.toml` add these lines at the end:

```
[ai]
binding = "AI"
```

3. Install the Workers AI SDK by running

```
npm install --save-dev @cloudflare/ai
```

4. Replace the `src/index.ts` file with the `index.ts` file from this repository

5. Deploy your worker to Cloudflare

```
npx wrangler dev
```

