export function changeTextareaValue(
	textarea: HTMLTextAreaElement,
	value: string,
) {
	textarea.value = value;

	const event = new Event("input", {
		bubbles: true,
		cancelable: true,
	});

	textarea.dispatchEvent(event);
}

export function changeContentEditableValue(
	element: HTMLElement,
	value: string,
) {
	// Clear existing content and set new content
	element.innerHTML = `<p>${value}</p>`;

	// Dispatch input event to notify the application
	const event = new Event("input", {
		bubbles: true,
		cancelable: true,
	});

	element.dispatchEvent(event);
}

export function simulateFileSelection(
	inputElement: HTMLInputElement,
	fileContent: string,
	fileName: string,
	fileType: string,
) {
	// Create a File object
	const file = new File([fileContent], fileName, { type: fileType });

	// Create a DataTransfer object and add the file
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(file);

	// Set the files property on the input element
	inputElement.files = dataTransfer.files;

	// Dispatch a change event
	const event = new Event("change", { bubbles: true });
	inputElement.dispatchEvent(event);
}

export function updateLexicalContent(el: HTMLElement, newText: string) {
	// @ts-ignore
	const editor = el.__lexicalEditor;
	if (!editor) {
		throw new Error("Lexical editor not found on the element.");
	}

	const jsonState = {
		root: {
			children: [
				{
					children: [
						{
							detail: 0,
							format: 0,
							mode: "normal",
							style: "",
							text: newText,
							type: "text",
							version: 1,
						},
					],
					direction: null,
					format: "",
					indent: 0,
					type: "paragraph",
					version: 1,
				},
			],
			direction: null,
			format: "",
			indent: 0,
			type: "root",
			version: 1,
		},
	};

	const newEditorState = editor.parseEditorState(JSON.stringify(jsonState));
	editor.setEditorState(newEditorState);
}
