export default class KeyBinding
{
	// User-friendly display name
	#name;
	get name() { return this.#name; }

	// KeyEvent.key
	#key;
	get key() { return this.#key; }

	// Modifiers
	#ctrl = false;
	#alt = false;
	#shift = false;

	get ctrl() { return this.#ctrl; }
	get alt() { return this.#alt; }
	get shift() { return this.#shift; }

	// Action linked to the binding
	#action;
	get action() { return this.#action; }

	constructor(name, key, modifiers, action)
	{
		this.#name = name;
		this.#key = key;
		this.#ctrl = modifiers.ctrl ?? false;
		this.#alt = modifiers.alt ?? false;
		this.#shift = modifiers.shift ?? false;
		this.#action = action;
	}

	matches(key, modifiers)
	{
		return this.#key === key
			&& this.#ctrl === (modifiers.ctrl ?? false)
			&& this.#alt === (modifiers.alt ?? false)
			&& this.#shift === (modifiers.shift ?? false);
	}
}