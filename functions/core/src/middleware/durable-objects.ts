import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { v4 } from 'uuid';

const durableObjectIdMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	let doId = getCookie(c, 'do-id');
	if (!doId) {
		doId = c.env.DURABLE_OBJECTS?.newUniqueId().toString() ?? v4();
		setCookie(c, 'do-id', doId, {
			expires: new Date(Date.now() + 31536000000),
			httpOnly: true,
			secure: c.env.ENVIRONMENT.includes('dev') ? false : true,
			sameSite: 'strict',
		});
	}
	const id = c.env.DURABLE_OBJECTS.idFromName(doId);
	const stub = c.env.DURABLE_OBJECTS.get(id);
	// Ideally, just idFromName should allow `.id.name` to be used directly inside the Durable Object.
	// Work around until the issue is resolved.
	// Ref: https://github.com/cloudflare/workerd/issues/2240
	await stub.setName(doId);

	c.set('doStub', stub);
	c.set('userId', doId);
	await next();
});

export { durableObjectIdMiddleware };
export default durableObjectIdMiddleware;
