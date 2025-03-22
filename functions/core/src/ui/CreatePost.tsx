import { FC } from 'hono/jsx';

const CreatePost: FC = async () => {
	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center space-x-4">
					<h2 className="text-2xl font-semibold text-gray-800">Create Workflow</h2>
				</div>
				<select
					name="workflowType"
					id="workflowType"
					className="block mt-1 border-1 border-gray-300 p-1 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				>
					<option value="timer">Timer</option>
					<option value="ai">AI</option>
				</select>
				<div id="timer" className="">
					<label htmlFor="duration" className="block text-sm font-medium text-gray-700">
						Duration (in seconds)
					</label>
					<input
						type="number"
						name="duration"
						id="duration"
						className="block p-1 border-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo placeholder-gray-500 sm:text-sm"
						value={30}
					/>
				</div>
				<div id="ai" className="hidden">
					<label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
						Prompt
					</label>
					<textarea
						name="prompt"
						id="prompt"
						className="block w-full mt-1 p-1 border-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo
                        placeholder-gray-500 sm:text-sm"
						placeholder="Create an image of a flamingo in a forest"
					/>
				</div>
				<button
					type="button"
					className="hidden inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600"
					id="createWorkflow"
				>
					Create
				</button>
			</div>
			<script
				type="module"
				async
				dangerouslySetInnerHTML={{
					__html: `
                const workflowType = document.getElementById('workflowType')
                const timer = document.getElementById('timer')
                const ai = document.getElementById('ai')
                const prompt = document.getElementById('prompt')
                const createWorkflow = document.getElementById('createWorkflow')


                workflowType.addEventListener('change', (e) => {
                    if (workflowType.value === 'timer') {
                        timer.classList.remove('hidden')
                        ai.classList.add('hidden')
                    } else {
                        timer.classList.add('hidden')
                        ai.classList.remove('hidden')
                    }
                })
                createWorkflow.addEventListener('click', async () => {
                    if (workflowType.value === 'timer') {
                        if (document.getElementById('duration').value <= 0) {
                            alert('Duration must be greater than 0')
                            return
                        }
                        await fetch('/api/timer', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                duration: parseInt(document.getElementById('duration').value),
                            }),
                        }).then((res) => {
                            if (!res.ok) {
                                console.error(res)
                                alert('Oops. Unable to create workflow')
                            } else {
                                alert('Workflow created')
                                location.reload()
                            }
                        }).catch((e) => {
                            console.error(e)
                            alert('Oops. Unable to create workflow')
                        })
                    } else {
                        await fetch('/api/ai', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                prompt: prompt.value,
                            }),
                        }).then((res) => {
                            if (!res.ok) {
                                console.error(res)
                                alert('Oops. Unable to create workflow')
                            } else {
                                alert('Workflow created')
                                location.reload()
                            }
                        }).catch((e) => {
                            console.error(e)
                            alert('Oops. Unable to create workflow')
                        })
                    }
                })
				`,
				}}
			/>
		</>
	);
};

export default CreatePost;
