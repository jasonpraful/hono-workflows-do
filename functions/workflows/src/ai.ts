import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

interface Env {
	AI: Ai;
	AI_IMAGES_BUCKET: R2Bucket;
}
type Params = {
	prompt: string;
	user_id: string;
	image_key: string;
};

export class AiWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		const { prompt, user_id, image_key } = event.payload;
		if (!prompt) throw new Error('Prompt is required');
		if (!user_id) throw new Error('User ID is required');
		if (!image_key) throw new Error('Image key is required');

		const imageExists = await this.env.AI_IMAGES_BUCKET.get(`${user_id}/${image_key}.jpeg`);
		if (imageExists) throw new Error('Image with that key already exists');

		let image = await step.do(
			'Generate Image',
			{
				retries: {
					limit: 3,
					delay: 1000,
					backoff: 'exponential',
				},
			},
			async () => {
				const response = await this.env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt });
				if (!response.image) throw new Error('No image generated');

				const binaryString = atob(response.image);
				return binaryString;
			}
		);

		if (!image) throw new Error('No image generated');
		let r2_response = await step.do('Save image to R2', { retries: { limit: 1, backoff: 'exponential', delay: 1000 } }, async () => {
			console.log('Saving image to R2');

			// @ts-ignore
			const img = Uint8Array.from(image, (m) => m.codePointAt(0));
			try {
				const r2_res = await this.env.AI_IMAGES_BUCKET.put(`${user_id}/${image_key}.jpeg`, img);
				return r2_res?.key;
			} catch (e) {
				throw new Error('Error saving image to R2');
			}
		});

		if (!r2_response) throw new Error('Failed to save image to R2');

		return r2_response;
	}
}

export default {
	async fetch(req: Request): Promise<Response> {
		let url = new URL(req.url);

		if (url.pathname.startsWith('/favicon')) {
			return Response.json({}, { status: 404 });
		}
		return Response.json({ status: '501 Not Implemented' }, { status: 501, statusText: '501 Not Implemented' });
	},
};
