export class UndoStack
{
	#name;

	/**
	 * A user-friendly identifier for this stack.
	 */
	get name() { return this.#name; }

	/**
	 * @summary The index in #actions of the first action to undo and the last one done.
	 */
	#currentIndex = 0;

	/**
	 * @summary FIFO pile of actions that can be undone.
	 */
	#actions = [];

	constructor(name)
	{
		this.#name = name;
	}

	redo()
	{
		if (this.#currentIndex == this.#actions.length - 1)
			return;
		
		this.#currentIndex++;
		this.#actions[this.#currentIndex].do();
	}

	undo()
	{
		if (this.#currentIndex == 0)
			return;
		
		this.#actions[this.#currentIndex].undo();
		this.#currentIndex--;
	}

	clear()
	{
		this.#currentIndex = 0;
		this.#actions = [];
	}

	addAction(undoableAction)
	{
		this.#actions.push(undoableAction);
		this.#currentIndex++;
	}

	runAction(undoableAction)
	{
		this.addAction(undoableAction);
		undoableAction.do();
	}
}

export class UndoableAction
{
	do()
	{
		throw new Error("Missing implementation");
	}

	undo()
	{
		throw new Error("Missing implementation");
	}
}

export class UndoableActionInline extends UndoableAction
{
	#do;
	#undo;

	constructor(doAction, undoAction)
	{
		this.#do = doAction;
		this.#undo = undoAction;
	}

	do()
	{
		this.#do.call(this, arguments);
	}

	undo()
	{
		this.#undo.call(this, arguments);
	}
}