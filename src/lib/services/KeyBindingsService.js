import Service from "./Service";

export default class KeyBindingsService extends Service
{
	#bindings = [];
	get bindings() { return this.#bindings; }

	register(binding)
	{
		this.#bindings.push(binding);
	}

	getBinding(key, modifiers)
	{
		for (const binding of this.#bindings)
		{
			if (binding.matches(key, modifiers))
			{
				return binding;
			}
		}
		return null;
	}
}