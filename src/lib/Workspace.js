import { Document } from "./data/Document";
import { fileService } from "./services";

export class Workspace
{
	documents = [];
	
	_currentDocument = null;
	get currentDocument() {	return this._currentDocument;	}

	_documentCounter = 1;

	newDocument()
	{
		const newDocument = new Document(`new ${this._documentCounter++}`);
		this.documents.push(newDocument);
		this.setCurrentDocument(newDocument);
	}

	setCurrentDocument(document)
	{
		this._currentDocument = document;
	}

	closeDocument(document)
	{
		const docIndex = this.documents.indexOf(document);
		if (docIndex === -1)
			return;

		this.documents.splice(docIndex, 1);
		if (this._currentDocument === document)
		{
			if (this.documents.length == 0)
			{
				this._currentDocument = null;
			}
			else
			{
				this._currentDocument = this.documents[Math.max(0, docIndex - 1)];
			}
		}
	}

	downloadDocument(document)
	{
		fileService.requestDownload(document);
	}
}