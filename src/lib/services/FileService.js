import { Document } from "../data/Document";

export default class FileService extends EventTarget
{
	loadFromFile(file)
	{
		this.#internalLoadFromFile(file).then(result => {
			try
			{
				const serializedDocument = JSON.parse(result.content);
				const document = Document.deserialize(serializedDocument);
				
				// Special case for V0
				if (document.name === null)
				{
					document.name = result.filename.replace(".json", "");
				}

				this.dispatchEvent(new CustomEvent("documentLoaded", { detail: document }));
			}
			catch(error)
			{
				console.error(error);
				// Dispatch error through NotificationService
			}
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
				resolve({
					filename: file.name,
					content: reader.result
				});
			});
			reader.readAsText(file, "UTF-8");
		});
	}

	requestDownload(document)
	{
		const serializedDocument = Document.serialize(document);
		const jsonString = JSON.stringify(serializedDocument);
		const blob = new Blob([jsonString], { type: "application/json" });
		const objectUrl = URL.createObjectURL(blob);
		this.dispatchEvent(new CustomEvent("downloadRequested", {
			detail: {
				filename: `${document.name}.json`,
				url: objectUrl,
			}
		}));
	}
}