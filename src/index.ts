/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
	AI: any;
}

import { Ai } from '@cloudflare/ai'
import { encode } from 'base64-arraybuffer';


async function readStreamToBase64(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    return new Promise<string>((resolve, reject) => {
        reader.read().then(function processChunk({ done, value }) {
            if (done) {
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const buffer = new Uint8Array(totalLength);
                let offset = 0;

                for (const chunk of chunks) {
                    buffer.set(chunk, offset);
                    offset += chunk.length;
                }

                const base64 = arrayBufferToBase64(buffer);
                resolve(`data:image/jpeg;base64,${base64}`);
                return;
            }

            chunks.push(value);
            reader.read().then(processChunk).catch(reject);
        }).catch(reject);
    });
}

function arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		//get character type
		const {searchParams} = new URL(request.url);
		const characterType = searchParams.get("characterType");
		const responseType = searchParams.get("responseType")?searchParams.get("responseType"):"json";

		const ai = new Ai(env.AI);
		const llm_model = "@hf/thebloke/zephyr-7b-beta-awq";
		// const txt2img_model = "@cf/lykon/dreamshaper-8-lcm";
		const txt2img_model = "@cf/bytedance/stable-diffusion-xl-lightning";

		//stage I - build RPG character story and characteristics
		const llm_prompt = 
		`generate a name for a fantasy character class: ${characterType}

		reveal the name and write one paragraph about the backround story of the character which should contain information about origin, powers and abilities
		
		always answer in JSON format:
  
		{"characterName":name of the character,
		"characterGender":[Male or Female],
		"characterClass":class of the character (a type of ${characterType}),
		"characterOrigins":short description of origins of the character,
		"characterPowers":short description of character powers and abilities,
		}
  
  
		JSON response:
		`;
		
		const llm_response:any = await ai.run(llm_model, {
			prompt: llm_prompt,
			max_tokens: 512
		  }
		);

		
		//JSON object containing:
		//characterName
		//characterClass
		//characterOrigins
		//characterPowers
		const characterFacts = JSON.parse(llm_response.response);
		

		const txt2img_prompt = 
		`rpg game style, digital painting of ${characterFacts.characterName}, a ${characterFacts.characterGender} ${characterFacts.characterClass}, 
		${characterFacts.characterPowers}, ${characterFacts.characterOrigins}
		`;

		const txt2img_response:any = await ai.run(
			txt2img_model,
			{
				prompt:txt2img_prompt,
				num_steps:6,
				guidance:1
			}
		);
		
		const base64ImageString = await readStreamToBase64(txt2img_response);
		
		if (responseType == "image"){
			return new Response(txt2img_response, {
				headers: {
				'content-type': 'image/png'
				}
			});
		} else if (responseType == "html"){
			const html = 
			`<h1>${characterFacts.characterName}</h1>
			<h2>${characterFacts.characterGender} ${characterFacts.characterClass}</h2>
			<p><strong>Origins:</strong> ${characterFacts.characterOrigins}</p>
			<p><strong>Powers:</strong> ${characterFacts.characterPowers}</p>
			<img src='${base64ImageString}' />
			`;
			return new Response(html, {
				headers: {
					'content-type': 'text/html'
				}
			});
		} else {
			characterFacts.image = base64ImageString;
			return Response.json(characterFacts);
		}
		// return new Response(response, {
		// headers: {
		// 	'content-type': 'image/png'
		// }
		// });
	},
};
