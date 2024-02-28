import { Ai } from '@cloudflare/ai';
import HTML from "./index.html";

const app = {
	async fetchImage(request, env) {
		const formData = await request.formData();
		const prompt = formData.get("prompt")
		const imageFile = formData.get("image")
		const maskFile = formData.get("mask")

		const imageArrayBuffer = await imageFile.arrayBuffer();
		const maskArrayBuffer = await maskFile.arrayBuffer();
		const ai = new Ai(env.AI);

		const inputs = {
			prompt: prompt,
			image: [...new Uint8Array(imageArrayBuffer)],
			mask: [...new Uint8Array(maskArrayBuffer)],
		};

		const response = await ai.run('@cf/runwayml/stable-diffusion-v1-5-inpainting', inputs);

		return new Response(response, {
			headers: {
				"content-type": "image/png",
			},
		});
	},
	html() {
		console.log(`HTML Response: ${HTML}`);
		return new Response(HTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
	}
}

export default {
	async fetch(request, env) {
		if (request.method === 'POST' && new URL(request.url).pathname === '/image') {
			return app.fetchImage(request, env);
		} else if (request.method === 'GET' && new URL(request.url).pathname === '/') {
			return app.html();
		} else {
			return new Response('Not Found', { status: 404 });
		}
	}
}