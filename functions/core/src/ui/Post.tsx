import { FC } from 'hono/jsx';
import { useRequestContext } from 'hono/jsx-renderer';

function StatusBadge({ status }: { status: InstanceStatus['status'] }) {
	const isCompleted = status === 'complete';
	const bgColor = isCompleted ? 'bg-green-100' : 'bg-yellow-100';
	const textColor = isCompleted ? 'text-green-800' : 'text-yellow-800';

	return (
		<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{status}</span>
	);
}
const Post: FC<{ id: string }> = async ({ id }) => {
	const c = useRequestContext<HonoEnv>();

	const doContext = await c.var.doStub.getWorkflows();
	const workflow = doContext.find((workflow) => workflow.id === id);
	if (!workflow) {
		return <h2>Workflow not found</h2>;
	}
	let status: InstanceStatus = {
		status: 'running',
		output: {},
	};
	try {
		if (workflow.type === 'timer') {
			let w = await c.env.TIMER_WORKFLOW.get(workflow.id);
			status = await w.status();
		} else {
			let w = await c.env.AI_WORKFLOW.get(workflow.id);
			status = await w.status();
		}
	} catch (e) {
		let error = e as unknown as WorkflowError;
		if (error.message == 'instance.not_found') {
			return <h2>Task not found</h2>;
		}
	}
	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-4">
				<h2 className="text-2xl font-semibold text-gray-800">{workflow.type === 'timer' ? 'Timer Status' : 'AI Generation'}</h2>
				<StatusBadge status={status.status} />
			</div>

			<div className="bg-gray-50 p-4 rounded-lg">
				<p className="text-gray-700">
					<span className="font-medium">ID:</span> {workflow.id}
				</p>

				{workflow.type === 'timer' && (
					<p className="text-gray-700">
						<span className="font-medium">Duration:</span> {workflow.duration}s
					</p>
				)}
				<p className="text-gray-700">
					{/* @ts-expect-error - Incorrect types shipped from CF for error */}
					<span className="font-medium">Output:</span> {status.output || status.error?.message || 'N/A'}
				</p>

				{workflow.type === 'ai' && (
					<>
						<p className="text-gray-700">
							<span className="font-medium">Prompt:</span> {workflow.prompt}
						</p>
						{status.status == 'complete' && workflow.image_key && (
							<div className="mt-4">
								<img src={`/api/image/${workflow.image_key}`} alt={workflow.prompt} className="rounded-lg shadow-sm max-h-100 w-auto" />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Post;
