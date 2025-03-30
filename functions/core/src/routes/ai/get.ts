import { RouteHandler, z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

const ParamSchema = z
	.object({
		workflowId: z.string({ required_error: 'Workflow Id is Required', invalid_type_error: 'Workflow Id is Invalid' }).uuid().openapi({
			example: '30c258bb-dace-4911-9875-3376d2bc722f',
			description: 'ID of workflow',
		}),
	})
	.openapi('Ai');
const ResponseSchema = z.object({
	status: z.string(),
	output: z.record(z.unknown()).optional(),
	debug: z.record(z.unknown()).optional(),
});

const route = createRoute({
	method: 'get',
	path: '/api/ai/{workflowId}',
	tags: ['Ai'],
	request: {
		params: ParamSchema,
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
	const { workflowId } = c.req.param();
	if (!c.env.AI_WORKFLOW) return c.json({ success: false, message: 'Service Currently Disabled' }, { status: 500 });
	try {
		const userHasWorkflow = await c.var.doStub.userHasWorkflow();
		if (!userHasWorkflow) return c.json({ success: false, message: 'Workflow not found' }, { status: 404 });

		const workflow = await c.env.AI_WORKFLOW.get(workflowId);
		const { status, output } = await workflow.status();

		return c.json({ status, output }, 200);
	} catch (e) {
		const error = e as WorkflowError;
		const status = error.message === 'instance.not_found' ? 404 : 500;
		const message = error.message === 'instance.not_found' ? 'Workflow not found' : 'Internal Server Error';

		return c.json({ success: false, message }, { status });
	}
};

export { route as getAiRoute, handler as getAiHandler };
