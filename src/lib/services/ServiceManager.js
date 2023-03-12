import Service from "./Service";

export default class ServiceManager
{
	#locked = false;
	#services = new Map();

	hmrEnv = false;

	register(serviceClass)
	{
		if (this.#locked)
		{
			if (this.hmrEnv)
				return;
			throw new Error(`Cannot register <${serviceClass.name}>: the manager is locked.`);
		}

		if (this.#services.has(serviceClass))
			throw new Error(`Cannot register <${serviceClass.name}>: already registered.`);

		if (Object.getPrototypeOf(serviceClass) != Service)
			throw new Error(`Cannot register <${serviceClass.name}>: it does not extends Service.`);

		this.#services.set(serviceClass, new serviceClass(this));
	}

	get(serviceClass)
	{
		return this.#services.get(serviceClass);
	}

	getServicesByName()
	{
		const result = {};
		for (const entry of this.#services.entries())
		{
			result[entry[0].name] = entry[1];
		}
		return result;
	}

	lockAndInit()
	{
		if (this.#locked)
		{
			if (this.hmrEnv)
				return;
			throw new Error("Cannot lock service manager: already locked.");
		}
		
		this.#locked = true;

		for (const service of this.#services.values())
		{
			service.init();
		}
	}
}