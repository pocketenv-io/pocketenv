/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.json`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const metadata = {
	redirect_uris: ['https://pocketenv.io/oauth/callback'],
	response_types: ['code'],
	grant_types: ['authorization_code', 'refresh_token'],
	scope: 'atproto repo:io.pocketenv.sandbox repo:sh.tangled.repo repo:sh.tangled.string repo:sh.tangled.pull repo:sh.tangled.pull.comment',
	token_endpoint_auth_method: 'private_key_jwt',
	token_endpoint_auth_signing_alg: 'ES256',
	jwks_uri: 'https://pocketenv.io/jwks.json',
	application_type: 'web',
	subject_type: 'public',
	authorization_signed_response_alg: 'RS256',
	client_id: 'https://pocketenv.io/oauth-client-metadata.json',
	client_name: 'Pocketenv',
	client_uri: 'https://pocketenv.io',
	dpop_bound_access_tokens: true,
};

const jwks = {
	keys: [
		{
			kty: 'EC',
			alg: 'ES256',
			kid: '06b0a81c-7950-4dbe-8ddc-022a3e4997d8',
			crv: 'P-256',
			x: 'gROA2cWzloO6YxQhyHsiOEAZNwdql9vnjBjUGYAxGfU',
			y: 'Q5AN7_kj_lCZrnbDlr7QEdemkeNWx7rBkKjBF-ual5U',
		},
		{
			kty: 'EC',
			alg: 'ES256',
			kid: '2867d54f-56f8-4d02-adb7-6ef75142c8cc',
			crv: 'P-256',
			x: 'wf-Nx8kx6rH30CS0ILWHmSYB12v3v20ucrkNNPdgUqI',
			y: 'LzCJEhzltf4mfeW2ju1rw-mYL273pKF2FJKEqsPaFNM',
		},
		{
			kty: 'EC',
			alg: 'ES256',
			kid: '0b671ab1-d51d-458d-bede-4e8852ec5001',
			crv: 'P-256',
			x: 'QshM55rfsX0SLZl9DuDpC_u3IquZE-BCXFS4A2-Vi9o',
			y: '07cPlcILsk6i8t7FfeZcjG_JFuSom8q4eP7CZJ4ntsU',
		},
	],
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		let redirectToApi = false;

		const API_ROUTES = ['/login', '/profile', '/token', '/oauth-client-metadata.json', '/jwks.json'];

		console.log('Request URL:', url.pathname, url.pathname === '/client-metadata.json');

		if (url.pathname === '/oauth-client-metadata.json') {
			return Response.json(metadata);
		}

		if (url.pathname === '/jwks.json') {
			return Response.json(jwks);
		}

		if (
			API_ROUTES.includes(url.pathname) ||
			url.pathname.startsWith('/oauth/callback') ||
			url.pathname.startsWith('/xrpc') ||
			url.pathname.startsWith('/ssh')
		) {
			redirectToApi = true;
		}

		if (redirectToApi) {
			const proxyUrl = new URL(request.url);
			proxyUrl.host = 'api.pocketenv.io';
			proxyUrl.hostname = 'api.pocketenv.io';
			return fetch(proxyUrl, request) as any;
		}

		const proxyUrl = new URL(request.url);
		proxyUrl.host = 'pocketenv.pages.dev';
		proxyUrl.hostname = 'pocketenv.pages.dev';
		return fetch(proxyUrl, request);
	},
} satisfies ExportedHandler<Env>;
