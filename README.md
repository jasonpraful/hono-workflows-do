# Cloudflare Workflows & Durable Object with Hono

## Demo

[hono-workflow.jasonpraful.co.uk](https://hono-workflow.jasonpraful.co.uk)

## Overview

- Hono Service with OpenAPI & Swagger UI
- Cloudflare Workflow:
  - Timer
  - AI - Generate Image and Push to Cloudflare R2
- Web UI powered by Hono JSX to trigger, and view the status of the workflows.
- Durables Objects to store the state of the workflows.

## Getting Started

```
bun install
```

```
bun run dev-bindings
```

## Why?

Cloudflare docs on workflows are bad, and there are no examples on how to trigger a workflow locally from another worker. The docs around services don't work for workflows, while it does for Durable Objects. The instructions around how to use `script_name` is very vague.

Secondly, Wrangler docs do not mention how to implement "Cross Script Calls" properly, there are no examples on how to do this. When you run both instances - workflow, and the service (hono), the service fails to bind to the workflow. The only way would be to run workflow with both the service and the workflow config (ref: functions/core/package.json#scripts.dev-binding).

Ref:

- [Cross Script Calls](https://developers.cloudflare.com/workflows/build/workers-api/#cross-script-calls)

## License

MIT

## Contributing

Feel free to contribute to this project. Please raise an issue before submitting a PR.
