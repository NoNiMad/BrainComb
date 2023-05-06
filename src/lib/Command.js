export class Command
{
	_execute = null;
	_canExecute = null;

	constructor(execute, canExecute)
	{
		this._execute = execute;
		this._canExecute = canExecute;
	}

	execute()
	{
		this._execute();
	}
	
	canExecute()
	{
		if (this._canExecute == null)
			return true;
		
		return this._canExecute();
	}
}

export class AsyncCommand
{
	_execute = null;
	_canExecute = null;

	constructor(execute, canExecute)
	{
		this._execute = execute;
		this._canExecute = canExecute;
	}

	async execute()
	{
		await this._execute();
	}
	
	async canExecute()
	{
		if (this._canExecute == null)
			return true;
		
		return await this._canExecute();
	}
}