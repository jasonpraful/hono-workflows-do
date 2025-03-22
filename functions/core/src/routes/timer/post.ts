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
	},
});

const handler: RouteHandler<typeof route, HonoEnv> = async (c) => {
	const { duration = 30 } = c.req.valid('json');
	let workflowId = 'unavailable';

	if (c.env.TIMER_WORKFLOW) {
		workflowId = (await c.env.TIMER_WORKFLOW.create({ params: { duration } })).id;
		await c.var.doStub.newWorkflow({ id: workflowId, type: 'timer', duration });
	}

	return c.json({
		success: workflowId == 'unavailable' ? false : true,
		workflowId,
	});
};

export { route as postTimerRoute, handler as postTimerHandler };
