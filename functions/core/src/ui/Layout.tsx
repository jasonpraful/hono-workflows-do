import type { Child, FC } from 'hono/jsx';
import { useRequestContext } from 'hono/jsx-renderer';

const Layout: FC<{ children: Child }> = async ({ children }) => {
	const context = useRequestContext<HonoEnv>();
	const state = await context.var.doStub.getWorkflows();
	const alarm = await context.var.doStub.getAlarm();

	return (
		<body>
			<div className="min-h-screen bg-gray-100">
				<div className="h-screen flex flex-col md:flex-row">
					{/* Navigation */}
					<nav className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col md:h-screen max-h-[50vh] md:max-h-screen">
						{/* Sticky Header */}
						<div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h1 className="text-xl font-semibold text-gray-800">State</h1>
								<div className="flex items-center gap-2">
									<a
										href="/workflow/new"
										className={`px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
											context.req.path === '/workflow/new' ? 'bg-gray-100' : 'bg-white'
										}
									`}
									>
										Create
									</a>
									<button
										id="reset"
										className="px-2 py-1 text-xs font-medium text-gray-700 bg-red-100 border border-gray-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									>
										Reset All
									</button>
								</div>
							</div>
						</div>

						{/* Scrollable List */}
						<div className="flex-1 overflow-y-auto">
							<ul className="p-4">
								{state.map((workflow) => (
									<li key={workflow.id} className="mb-2">
										<a
											href={`/workflow/${workflow.id}`}
											className={`block w-full py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 ${
												context.req.path === `/workflow/${workflow.id}` ? 'bg-gray-100 text-gray-900' : ''
											}`}
										>
											{workflow.type === 'timer' ? (
												<>
													<b>Timer:</b> {workflow.duration ?? 'unknown'}s
												</>
											) : (
												<>
													<b>AI:</b> {workflow.prompt}
												</>
											)}
										</a>
									</li>
								))}
							</ul>
						</div>

						{/* Footer */}
						<div className="border-t border-gray-200 p-4 bg-white">
							<div className="flex flex-col space-y-2 text-sm text-gray-600">
								<div className="flex items-center justify-between">
									<span>Total Workflows:</span>
									<span className="font-medium">{state.length}</span>
								</div>
								<div className="flex row items-center space-x-4">
									<a
										href="https://github.com/jasonpraful/hono-workflows-do"
										target="_blank"
										rel="noopener noreferrer"
										className="text-gray-600 hover:text-gray-800"
									>
										<div className="flex items-center gap-2">
											<svg viewBox="0 0 98 96" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
												<path
													fill-rule="evenodd"
													clip-rule="evenodd"
													d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
													fill="#24292f"
												/>
											</svg>
											Source
										</div>
									</a>
									<a href="/swagger" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
										API Docs
									</a>
								</div>
								<div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600">
									<p>
										Your workspace data is automatically preserved for 30 days from your last activity. Any interaction refreshes this
										period, ensuring your work is maintained while you're active.
									</p>
									<p className="mt-2">
										Resetting on: <span className="font-medium">{alarm ? new Date(alarm).toLocaleString() : 'N/A'}</span>
									</p>
								</div>
							</div>
						</div>
					</nav>

					{/* Content Area */}
					<main className="flex-1 p-4 overflow-y-auto bg-white">{children}</main>
				</div>
			</div>
			<script
				async
				dangerouslySetInnerHTML={{
					__html: `
					const resetButton = document.getElementById('reset')
					resetButton.addEventListener('click', async () => {
						await fetch('/api/state', { method: 'DELETE' }).then((res) => {
							if (!res.ok) {
								console.error(res)
								alert('Oops. Unable to reset')
							} else {
								location.href = '/'
							}
						}).catch(console.error)
					})
					`,
				}}
			/>
		</body>
	);
};

export default Layout;
