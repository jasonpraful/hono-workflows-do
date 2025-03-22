import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

interface Env {}
type Params = { duration: number };

export class TimerWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		if (!event.payload?.duration) throw new Error('Duration is required');
		step.do('Log Status', async () => {
			return 'Workflow Started!';
		});
		await step.sleep('Going into sleep', `${event.payload.duration} seconds`);
		console.log('Workflow Complete');
		return 'Workflow Complete!';
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
