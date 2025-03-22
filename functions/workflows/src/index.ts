export { TimerWorkflow } from './timer';
export { AiWorkflow } from './ai';

export default {
	async fetch(req: Request): Promise<Response> {
		let url = new URL(req.url);

		if (url.pathname.startsWith('/favicon')) {
			return Response.json({}, { status: 404 });
		}
		return Response.json({ status: '501 Not Implemented' }, { status: 501, statusText: '501 Not Implemented' });
	},
};
