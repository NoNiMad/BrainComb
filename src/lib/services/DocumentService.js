import Service from "./Service";
import VueService from "./VueService";

export default class DocumentService extends Service
{
	#lastDocumentName = "SimpleMind.json";

	loadFromFile(file)
	{
		this.#internalLoadFromFile(file).then(fileContent => {
			this.serviceManager.get(VueService).app.loadFromText(fileContent);
		});
	}

	async #internalLoadFromFile(file)
	{
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("loadend", _ =>
			{
				if (reader.error !== null)
				{
					reject(reader.error);
					return;
				}
	
				this.#lastDocumentName = file.name;
				resolve(reader.result);
			});
			reader.readAsText(file, "UTF-8");
		});
	}

	getDownloadName()
	{
		return this.#lastDocumentName;
	}

	getDownloadUrl()
	{
		const documentRoot = this.serviceManager.get(VueService).app.mapRoot;

		const ignoredKeys = [ "parent", "x", "y" ]
		const serialized = JSON.stringify(
			documentRoot,
			(key, val) => {
				if (ignoredKeys.includes(key))
					return;
				if (key === "children" && val.length === 0)
					return;
				return val;
			},
			"\t"
		);
		
		const blob = new Blob([serialized], { type: "application/json" });
		return URL.createObjectURL(blob);
	}
}