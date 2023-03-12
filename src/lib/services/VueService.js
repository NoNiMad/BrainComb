import Service from "./Service";

export default class VueService extends Service
{
	#app = null;

	set app(value)
	{
		if (this.#app != null)
			throw new Error("Cannot set VueService app instance twice.");
		this.#app = value;
	}

	get app()
	{
		if (this.#app == null)
			throw new Error("VueService app instance has not been set and cannot be accessed.")
		return this.#app;
	}
}