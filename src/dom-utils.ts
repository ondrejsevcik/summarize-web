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

