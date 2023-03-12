export class Command
{
	#execute = null;
	#canExecute = null;

	constructor(execute, canExecute)
	{
		this.#execute = execute;
		this.#canExecute = canExecute;
	}

	execute(caller, args)
	{
		this.#execute(caller, args);
	}
	
	canExecute(caller, args)
	{
		if (this.#canExecute == null)
			return true;
		
		return this.#canExecute(caller, args);
	}
}

export class AsyncCommand
{
	#execute = null;
	#canExecute = null;

	constructor(execute, canExecute)
	{
		this.#execute = execute;
		this.#canExecute = canExecute;
	}

	async execute(caller, args)
	{
		await this.#execute(caller, args);
	}
	
	async canExecute(caller, args)
	{
		if (this.#canExecute == null)
			return true;
		
		return await this.#canExecute(caller, args);
	}
}