import { Command } from "./Command";
import services from "../services";

export default class OpenFileCommand extends Command
{
	#fileInput = null;

	#initFileInput()
	{
		const input = document.createElement("input");
		input.type = "file";
		input.addEventListener("change", event => this.#onInputChanged(event));
		this.#fileInput = input;
	}

	execute()
	{
		if (this.#fileInput == null)
			this.#initFileInput();

		this.#fileInput.click();
	}

	#onInputChanged(event)
	{
		const file = event.target.files[0];
		services.DocumentService.loadFromFile(file);
	}
}