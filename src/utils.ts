/**
 * @deprecated This function is deprecated and will be removed in a future version.
 */
export function querySelectorPromise<E extends Element = Element>(
	selector: string,
	timeout = 500,
) {
	return new Promise((resolve, reject) => {
		let intervalId: number | null = null;
		let timeoutId: number | null = null;

		const checkElement = () => {
			const element = document.querySelector<E>(selector);
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

/**
 * Awaits a promise and returns a tuple containing either an error or the result.
 */
export async function perform<T>(promise: Promise<T>): Promise<[null, T] | [Error, null]> {
	try {
		const result = await promise;
		return [null, result];
	} catch (err) {
		return [err as Error, null];
	}
}
/**
 * Asynchronously waits for an element matching the selector to appear in the DOM.
 * Keeps trying until the element is found or timeout is reached.
 *
 * @param selector - CSS selector string to find the element
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise resolving to the found element
 * @throws Error if the element is not found within the timeout period
 */
export async function querySelectorAsync<E extends Element = Element>(
	selector: string,
	timeout = 5000,
): Promise<E> {
	// First try immediately - element might already be in the DOM
	const element = document.querySelector<E>(selector);
	if (element) {
		return element;
	}

	// Set up the timeout promise that rejects after specified time
	const timeoutPromise = new Promise<never>((_, reject) => {
		setTimeout(
			() =>
				reject(
					new Error(
						`Timeout: Element with selector "${selector}" not found within ${timeout}ms`,
					),
				),
			timeout,
		);
	});

	// Set up the polling promise that resolves when element is found
	const pollingPromise = new Promise<E>((resolve) => {
		// How often to check for the element (in milliseconds)
		const checkInterval = 100;

		const checkForElement = (): void => {
			const element = document.querySelector<E>(selector);

			if (element) {
				// Element found, resolve the promise with the element
				resolve(element);
			} else {
				// Element not found yet, schedule another check
				setTimeout(checkForElement, checkInterval);
			}
		};

		// Start checking
		checkForElement();
	});

	// Race the polling against the timeout - let the error propagate if timeout occurs
	return await Promise.race<E>([pollingPromise, timeoutPromise]);
}
