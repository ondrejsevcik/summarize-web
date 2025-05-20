/**
 * Returns a Promise that resolves with the first element found matching the given selector.
 * The function polls the DOM at regular intervals until the element is found or the maximum timeout is reached.
 * 
 * @param selector - The CSS selector string to match elements against
 * @param timeout - The polling interval in milliseconds (default: 500ms)
 * @returns A Promise that resolves with the found DOM element
 * @throws Error if the element is not found within 5 seconds
 * 
 * @example
 * // Find an element with class 'my-element'
 * querySelectorPromise('.my-element')
 *   .then(element => console.log('Found:', element))
 *   .catch(error => console.error(error));
 */
export function querySelectorPromise(selector: string, timeout = 500) {
	return new Promise((resolve, reject) => {
		let intervalId: number | null = null;
		let timeoutId: number | null = null;

		const checkElement = () => {
			const element = document.querySelector(selector);
			if (element) {
				if (intervalId) clearInterval(intervalId);
				if (timeoutId) clearTimeout(timeoutId);
				resolve(element);
				console.debug(`Element ${selector} found`);
			}
		};

		intervalId = setInterval(checkElement, timeout);
		timeoutId = setTimeout(() => {
			clearInterval(intervalId);
			reject(
				new Error(
					`Element with selector "${selector}" was not found within the timeout period.`,
				),
			);
		}, 5000); // Maximum wait for 5 seconds.
	});
}

/**
 * Returns a Promise that resolves after a specified amount of time.
 */
export function waitForTime(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
