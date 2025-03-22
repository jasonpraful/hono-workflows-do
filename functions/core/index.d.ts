import { DOWorkflows } from './src/do/workflows';

declare global {
	type Bindings = {
		TIMER_WORKFLOW: Workflow;
		AI_WORKFLOW: Workflow;
		DURABLE_OBJECTS: DurableObjectNamespace<DOWorkflows>;
		ENVIRONMENT: string;
		AI_IMAGES_BUCKET: R2Bucket;
	};

	type Variables = {
		doStub: DurableObjectStub<DOWorkflows>;
		userId: string;
	};

	type HonoEnv = {
		Bindings: Bindings;
		Variables: Variables;
	};
}

export {};
