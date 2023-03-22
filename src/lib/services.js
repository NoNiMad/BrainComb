import ServiceManager from "./services/ServiceManager";

import DocumentService from "./services/DocumentService";
import VueService from "./services/VueService";
import KeyBindingsService from "./services/KeyBindingsService";

const serviceManager = new ServiceManager();

if (import.meta.hot)
{
	serviceManager.hmrEnv = true;
}

serviceManager.register(DocumentService);
serviceManager.register(VueService);
serviceManager.register(KeyBindingsService);

serviceManager.lockAndInit();

const defaultExport = serviceManager.getServicesByName();
defaultExport["ServiceManager"] = serviceManager;
export default defaultExport;