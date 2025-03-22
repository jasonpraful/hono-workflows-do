import type { Child, FC } from 'hono/jsx';
import { useRequestContext } from 'hono/jsx-renderer';

const Layout: FC<{ children: Child }> = async ({ children }) => {
	const context = useRequestContext<HonoEnv>();
	const state = await context.var.doStub.getWorkflows();
	return (
		<body>
			<div class="min-h-screen p-4 md:p-8 flex items-center justify-center">
				<div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden h-full w-full">
					<div class="flex h-full">
						<div class="w-64 bg-gray-50 border-r border-gray-200">
							<div class="p-6 mb-2">
								<div class={`flex items-center justify-between`}>
									<h1 class="text-2xl font-semibold text-gray-800 mt-auto mb-auto">State</h1>
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
										className="px-2 py-1 text-xs font-medium text-gray-700 bg-red-100 border border-gray-300 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
										id="reset"
									>
										Reset
									</button>
								</div>
								<ul class="space-y-2 overflow-y-auto h-100">
									{state.map((workflow) => (
										<li key={workflow.id}>
											<a
												href={`/workflow/${workflow.id}`}
												class={`block py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 truncate ${
													context.req.path === `/workflow/${workflow.id}` ? 'bg-gray-100' : ''
												}`}
											>
												{workflow.type === 'timer' ? (
													<p>
														<b>Timer:</b> {workflow.duration ?? 'unknown'}s
													</p>
												) : (
													<p>
														<b>AI:</b> {workflow.prompt}
													</p>
												)}
											</a>
										</li>
									))}
								</ul>
								<div class="mt-4">
									<p class="text-sm text-gray-500">Total: {state.length}</p>
									<a href="/swagger" class="text-sm text-gray-500 hover:underline">
										API Docs
									</a>
								</div>
							</div>
						</div>
						<main class="flex-1 p-8 overflow-y-auto">{children}</main>
					</div>
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
