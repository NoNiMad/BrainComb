export default class Service extends EventTarget
{
	serviceManager = null;

	constructor(serviceManager)
	{
		super();
		this.serviceManager = serviceManager;
	}

	init()
	{}
}