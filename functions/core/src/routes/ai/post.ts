import { RouteHandler, z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

const AiSchema = z
	.object({
		prompt: z.string({ required_error: 'Prompt is required' }).openapi({
			example: 'Create an image of a flamingo with a sunset in the background',
			description: 'Duration in seconds',
		}),
	})
	.openapi('Ai');
const ResponseSchema = z.object({
	success: z.boolean(),
	workflowId: z.string(),
});

const route = createRoute({
	method: 'post',
	path: '/api/ai',
	tags: ['Ai'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: AiSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ResponseSchema,
				},
			},
			description: 'Workflow Response',
		},
	},
});

const handler: RouteHandler<typeof route, HonoEnv> = async (c) => {
	const { prompt } = c.req.valid('json');
	const user_id = c.get('userId');
	const image_key = Date.now().toString();
	let workflowId = { id: 'unavailable' };

	if (c.env.AI_WORKFLOW) {
		workflowId = await c.env.AI_WORKFLOW.create({ params: { prompt, user_id, image_key } });
		await c.var.doStub.newWorkflow({ id: workflowId.id, type: 'ai', image_key: `${image_key}.jpeg`, prompt });
	}

	return c.json({
		success: workflowId.id == 'unavailable' ? false : true,
		workflowId: workflowId.id,
	});
};

export { route as postAiRoute, handler as postAiHandler };
