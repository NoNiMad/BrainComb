import OpenFileCommand from "./commands/OpenFileCommand.js";
import SaveFileCommand from "./commands/SaveFileCommand.js";

export default {
	"OpenFile": new OpenFileCommand(),
	"SaveFile": new SaveFileCommand(),
};