import { RouteHandler, z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

const TimerSchema = z
	.object({
		duration: z.number().openapi({
			example: 10,
			description: 'Duration in seconds',
		}),
	})
	.openapi('Timer');
const ResponseSchema = z.object({
	success: z.boolean(),
	workflowId: z.string(),
});

const route = createRoute({
	method: 'post',
	path: '/api/timer',
	tags: ['Timer'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: TimerSchema,
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
		400: {
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
				},
			},
			description: 'Bad Request',
		},
	},
});

const handler: RouteHandler<typeof route, HonoEnv> = async (c) => {
	const { duration = 30 } = c.req.valid('json');

	if (duration > 3600) {
		return c.json(
			{
				success: false,
				message: 'Duration must be less than 1 hour',
			},
			400
		);
	}

	let workflowId = 'unavailable';

	if (c.env.TIMER_WORKFLOW) {
		workflowId = (await c.env.TIMER_WORKFLOW.create({ params: { duration } })).id;
		await c.var.doStub.newWorkflow({ id: workflowId, type: 'timer', duration });
	}

	return c.json({
		success: workflowId == 'unavailable' ? false : true,
		workflowId,
	}, 200);
};

export { route as postTimerRoute, handler as postTimerHandler };
