export class KeyBinding
{
	_name;
	/**
	 * User-friendly display name.
	 */
	get name() { return this._name; }

	/**
	 * The key for this key-binding.
	 */
	_key;
	get key() { return this._key; }

	_ctrl = false;
	/**
	 * Control key modifier.
	 */
	get ctrl() { return this._ctrl; }

	_alt = false;
	/**
	 * Alt key modifier.
	 */
	get alt() { return this._alt; }
	
	_shift = false;
	/**
	 * Shift key modifier.
	 */
	get shift() { return this._shift; }

	/**
	 * Command to execute.
	 */
	_command;
	get command() { return this._command; }
	
	constructor(name, key, modifiers, command)
	{
		this._name = name;
		this._key = key;
		this._ctrl = modifiers.ctrl ?? false;
		this._alt = modifiers.alt ?? false;
		this._shift = modifiers.shift ?? false;
		this._command = command;
	}

	matches(key, modifiers)
	{
		return this._key === key
			&& this._ctrl === (modifiers.ctrl ?? false)
			&& this._alt === (modifiers.alt ?? false)
			&& this._shift === (modifiers.shift ?? false);
	}
}