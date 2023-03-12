import { Command } from "./Command";
import services from "../services";

export default class SaveFileCommand extends Command
{
	#downloadLink = null;

	#initDownloadLink()
	{
		const link = document.createElement("a");
		this.#downloadLink = link;
	}

	execute()
	{
		if (this.#downloadLink == null)
			this.#initDownloadLink();

		const docService = services.DocumentService;
		this.#downloadLink.href = docService.getDownloadUrl();
		this.#downloadLink.download = docService.getDownloadName();
		this.#downloadLink.click();
	}
}