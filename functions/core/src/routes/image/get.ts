import { RouteHandler, z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

const ParamSchema = z
	.object({
		id: z.string({ required_error: 'Image key is Required', invalid_type_error: 'Image key is Invalid' }).openapi({
			example: '1742656397106.jpeg',
			description: 'ID of image',
		}),
	})
	.openapi('Ai');

const route = createRoute({
	method: 'get',
	path: '/api/image/{id}',
	tags: ['Ai', 'Image'],
	request: {
		params: ParamSchema,
	},
	responses: {
		200: {
			description: 'Returns image from R2',
		},
		500: {
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
				},
			},
			description: 'Internal Server Error',
		},
		404: {
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
				},
			},
			description: 'Workflow not found',
		},
	},
});

const handler: RouteHandler<typeof route, HonoEnv> = async (c) => {
	const { id } = c.req.param();
	const user_id = c.get('userId');
	if (!c.env.AI_IMAGES_BUCKET) return c.json({ success: false, message: 'Service Currently Disabled' }, { status: 500 });
	try {
		const image = await c.env.AI_IMAGES_BUCKET.get(`${user_id}/${id}`);
		if (!image) {
			return c.json(
				{
					message: 'Invalid Image Id',
					status: 404,
				},
				404
			);
		}

		const data = await image.arrayBuffer();
		const contentType = image.httpMetadata?.contentType || 'image/jpeg';
		return c.body(data, 200, {
			'Content-Type': contentType,
		});
	} catch (e) {
		const error = e as WorkflowError;
		const status = error.message === 'instance.not_found' ? 404 : 500;
		const message = error.message === 'instance.not_found' ? 'Workflow not found' : 'Internal Server Error';

		return c.json({ success: false, message }, { status });
	}
};

export { route as getImageRoute, handler as getImageHandler };
