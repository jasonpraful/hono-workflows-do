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
	private async getStoredWorkflows(): Promise<Array<Workflow>> {
		return (await this.ctx.storage.get<Array<Workflow>>('workflows')) || [];
	}

	async newWorkflow(workflow: Workflow) {
		const workflows = await this.getStoredWorkflows();
		workflows.push(workflow);
		await this.ctx.storage.put('workflows', workflows);
		return 'Workflow created';
	}

	async getWorkflows() {
		return await this.getStoredWorkflows();
	}

	async userHasWorkflow(id: string) {
		const workflows = await this.getStoredWorkflows();
		return workflows.some((workflow) => workflow.id === id);
	}

	async reset() {
		const workflows = await this.getStoredWorkflows();
		for (const workflow of workflows) {
			if (workflow.type === 'ai' && workflow.image_key) {
				try {
					await this.env.AI_IMAGES_BUCKET.delete(`${this.ctx.id}/${workflow.image_key}`);
				} catch (e) {
					console.error(e);
				}
			}
		}
		await this.ctx.storage.delete('workflows');
		return 'Workflows reset';
	}
}
