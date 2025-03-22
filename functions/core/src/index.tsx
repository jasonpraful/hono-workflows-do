import { DOWorkflows } from './do/workflows';
import { hc } from 'hono/client';
import { OpenAPIHono } from '@hono/zod-openapi';
import { logger } from 'hono/logger';
import { swaggerUI } from '@hono/swagger-ui';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Suspense } from 'hono/jsx';

// Middleware
import durableObjectIdMiddleware from './middleware/durable-objects';

// API Routes & Handlers
import { postTimerHandler, postTimerRoute } from './routes/timer/post';
import { getTimerHandler, getTimerRoute } from './routes/timer/get';
import { getStateHandler, getStateRoute } from './routes/state/get';
import { deleteStateHandler, deleteStateRoute } from './routes/state/reset';
import { postAiHandler, postAiRoute } from './routes/ai/post';
import { getAiHandler, getAiRoute } from './routes/ai/get';
import { getImageHandler, getImageRoute } from './routes/image/get';

// UI Components
import Layout from './ui/Layout';
import Post from './ui/Post';
import CreatePost from './ui/CreatePost';

const app = new OpenAPIHono<HonoEnv>({
	defaultHook: (result, c) => {
		if (!result.success) {
			return c.json(
				{
					ok: false,
					errors: result,
					source: 'custom_error_handler',
				},
				422
			);
		}
	},
});

app.use(logger());

app.use(durableObjectIdMiddleware);

// API Endpoints

// Durable Object State
app.openapi(getStateRoute, getStateHandler);
app.openapi(deleteStateRoute, deleteStateHandler);

// Timer routes
app.openapi(getTimerRoute, getTimerHandler);
app.openapi(postTimerRoute, postTimerHandler);

// AI routes
app.openapi(postAiRoute, postAiHandler);
app.openapi(getAiRoute, getAiHandler);

// Get Generated Image
app.openapi(getImageRoute, getImageHandler);

app.doc('/openapi', {
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Hono Workflows Boilerplate API',
	},
});

app.get('/swagger', swaggerUI({ url: '/openapi' }));

// UI

// Layout
app.get(
	'*',
	jsxRenderer(
		({ children }) => {
			return (
				<html>
					<head>
						<meta charset="UTF-8" />
						<meta name="description" content="Demo of Hono with Durable Objects and Workflows." />
						<meta name="keywords" content="Hono, Durable Objects, Workflows, JavaScript, TypeScript" />
						<meta name="author" content="Jason Praful" />
						<meta property="og:title" content="Hono + Durable Objects + Workflows" />
						<meta property="og:description" content="Demo of Hono with Durable Objects and Workflows." />
						<meta property="og:type" content="website" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
						<title>Hono + Durable Objects + Workflows</title>
					</head>
					<Layout>{children}</Layout>
				</html>
			);
		},
		{ stream: true }
	)
);

// Routes
app.get('/', (c) => {
	return c.render(
		<Suspense fallback={<div>loading...</div>}>
			<div className="flex flex-col items-center justify-center md:justify-center md:items-center md:h-screen gap-4">
				<div className="text-4xl">Welcome to Hono Workflows</div>
				<p className="text-lg text-gray-600">Demo of Hono with Durable Objects and Workflows. Get started by creating a new workflow.</p>
				<div className="flex space-x-4">
					<a href="/workflow/new" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						Create New Workflow
					</a>
				</div>
			</div>
		</Suspense>
	);
});

app.get('/workflow/new', async (c) => {
	return c.render(
		<Suspense fallback={<div>loading...</div>}>
			<CreatePost />
		</Suspense>
	);
});

app.get('/workflow/:id', async (c) => {
	return c.render(
		<Suspense fallback={<div>loading...</div>}>
			<Post id={c.req.param('id')} />
		</Suspense>
	);
});

// RPC Client
export const client = hc<typeof app>('http://0.0.0.0:8787/');

export default app;

export { DOWorkflows };
