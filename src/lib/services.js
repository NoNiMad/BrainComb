import ServiceManager from "./services/ServiceManager";

import DocumentService from "./services/DocumentService.js";
import VueService from "./services/VueService.js";

const serviceManager = new ServiceManager();

if (import.meta.hot)
{
	serviceManager.hmrEnv = true;
}

serviceManager.register(DocumentService);
serviceManager.register(VueService);

serviceManager.lockAndInit();

const defaultExport = serviceManager.getServicesByName();
defaultExport["ServiceManager"] = serviceManager;
export default defaultExport;