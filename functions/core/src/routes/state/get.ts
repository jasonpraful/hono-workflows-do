import { RouteHandler, z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

const ResponseSchema = z.object({
	success: z.boolean(),
	workflows: z.array(
		z.object({
			id: z.string(),
			type: z.enum(['timer', 'ai']),
		})
	),
});

const route = createRoute({
	method: 'get',
	path: '/api/state',
	tags: ['State'],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ResponseSchema,
				},
			},
			description: 'Workflow Response',
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
		const workflows: { id: string; type: 'ai' | 'timer' }[] = await c.var.doStub.getWorkflows();
		if (!Array.isArray(workflows)) return c.json({ success: false, message: 'Service Currently Disabled' }, { status: 500 });

		return c.json(
			{
				success: true,
				workflows,
			},
			{ status: 200 }
		);
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

export { route as getStateRoute, handler as getStateHandler };
