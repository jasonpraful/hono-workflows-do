import { RouteHandler, z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
	method: 'delete',
	path: '/api/state',
	tags: ['State'],
	responses: {
		200: {
			description: 'Reset Response',
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
	},
});

const handler: RouteHandler<typeof route, HonoEnv> = async (c) => {
	try {
		await c.var.doStub.reset();
		return c.text('OK', { status: 200 });
	} catch (e: unknown) {
		if (e instanceof Error) {
			return c.json(
				{
					success: false,
					message: e.message,
				},
				{ status: 500 }
			);
		}
		return c.json(
			{
				success: false,
				message: 'An unknown error occurred',
			},
			{ status: 500 }
		);
	}
};

export { route as deleteStateRoute, handler as deleteStateHandler };
