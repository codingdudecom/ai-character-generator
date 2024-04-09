# AI Character Generator
Easy-to-use AI character generator that can be integrated in any app. It's based on Cloudflare Workers AI.

The code generates a name, back story, description of powers and traits plus the image of the character that is consistent with the description.
The only input necessary is a string that contains a minimal description (eg. the the class of the character or its species).

# Demo

Check out a live demo of how this works: [AI Character Generator](https://www.nickname-generator.net/blog/fantasy-character-names/)

# How to install

First create a Wrangler project for making a Cloudflare Worker. Follow [this guide](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/), which in short means:

## 1. Create a NodeJS project from the Cloudflare Workers template:

```
npm create cloudflare@latest
```

Input a name for your project (eg. ai-character-generator) and check `Yes` for everthing except for deployment. We will do that later.

## 2. Go into the project folder created and find the `wrangler.toml` file. You need to activate the Workers AI for Cloudflare feature.

```
cd ai-character-generator
```

In `wrangler.toml` add these lines at the end:

```
[ai]
binding = "AI"
```

## 3. Install the Workers AI SDK by running

```
npm install --save-dev @cloudflare/ai
```

## 4. Replace the `src/index.ts` file with the `src/index.ts` file from this repository

## 5. Run your worker locally for testing

```
npx wrangler dev
```

## 6. Deploy your worker to Cloudflare

```
npx wrangler deploy
```

# How to use

After deploying your worker you should get a URL to use for accessing it. The URL looks like `https://ai-character-generator.<YOUR-SUBDOMAIN>.workers.dev`

This URL is setup to respond to `GET` requests. Here are the params:

## Input parameters
***characterType***

A string parameter that describes the RPG character you want to create. Include things like gender, race, class, etc. A good example would be `female elvish warrior`

***responseType***

Can be either `json` (default) or `html`. 

## Ouptut (JSON)

When you send a request for JSON, it will return an answer with the following structure:

```json
{
    "characterName": ...,
    "characterGender": ...,
    "characterClass": ...,
    "characterOrigins": ...,
    "characterPowers": ...,
    "image": "data:image/jpeg;base64,..."
}
```


# About this project

At its core it is using 2 Cloudflare Workers AI models:

1. **LLM** - The _[zephyr-7b-beta-awq](https://developers.cloudflare.com/workers-ai/models/zephyr-7b-beta-awq/)_ is a lightweight and fast text generation model. I use it for creating the textual information for the RPG character
2. **Image Generation** - The _[dreamshaper-8-lcm](https://developers.cloudflare.com/workers-ai/models/dreamshaper-8-lcm/)_ is a text to image generator that is fast and appropriate for generating images (especially in the digital painting style). This is a variation on the [Stable Diffusion](https://stability.ai/stable-image) model, and LCM (Latent Consistency Model) is an optimization of the model which renders quality images with impressive speed.
