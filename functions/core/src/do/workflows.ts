import { DurableObject } from 'cloudflare:workers';

export type Workflow =
	| {
			id: string;
			type: 'timer';
			duration: number;
	  }
	| {
			id: string;
			type: 'ai';
			prompt: string;
			image_key: string;
	  };

export class DOWorkflows extends DurableObject<HonoEnv['Bindings']> {
	constructor(ctx: DurableObjectState, env: HonoEnv['Bindings']) {
		super(ctx, env);
	}

	private _name?: string;

	get name(): string {
		if (!this._name) {
			throw new Error('Name not set. Use setName() to set the name.');
		}
		return this._name;
	}

	// Remote RPC method is called to set the name.
	// Hence the async function.
	async setName(name: string) {
		if (!name) {
			throw new Error('Name cannot be empty');
		}
		if (this._name && this._name !== name) {
			throw new Error('Name already set. Use a different instance.');
		}
		this._name = name;
	}

	private async getStoredWorkflows(): Promise<Array<Workflow>> {
		return (await this.ctx.storage.get<Array<Workflow>>('workflows')) || [];
	}

	async newWorkflow(workflow: Workflow) {
		const workflows = await this.getStoredWorkflows();
		workflows.push(workflow);
		await this.ctx.storage.put('workflows', workflows);

		// Resetting the alarm to 30 days from now.
		await this.ctx.storage.deleteAlarm();
		await this.ctx.storage.setAlarm(Date.now() + 30 * 24 * 60 * 60 * 1000);

		return 'Workflow created';
	}

	async getWorkflows() {
		return await this.getStoredWorkflows();
	}

	async userHasWorkflow() {
		const workflows = await this.getStoredWorkflows();
		return workflows.some((workflow) => workflow.id === this.name.toString());
	}

	async reset(triggeredFromAlarm = false) {
		console.log('Resetting workflows...', this._name);
		const id = this.name;
		if (!id) throw new Error('Durable Object ID not found');
		const workflows = await this.getStoredWorkflows();
		for (const workflow of workflows) {
			if (workflow.type === 'ai' && workflow.image_key) {
				try {
					console.log(`Deleting image from bucket... ${id}/${workflow.image_key}`);
					await this.env.AI_IMAGES_BUCKET.delete(`${id}/${workflow.image_key}`);
				} catch (e) {
					console.error(e);
				}
			}
		}
		if (!triggeredFromAlarm) await this.ctx.storage.deleteAlarm();
		await this.ctx.storage.deleteAll();
		return 'Workflows reset';
	}

	async getAlarm() {
		const alarm = await this.ctx.storage.getAlarm();
		return alarm;
	}

	async alarm() {
		try {
			if (!this.name) throw new Error('Alarm triggered without a valid ID');
			await this.reset(true);
		} catch (e) {
			console.error(e);
		}
	}
}
