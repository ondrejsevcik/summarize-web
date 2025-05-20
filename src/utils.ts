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
 * ```
 */
async function to<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
	try {
		const result = await promise;
		return [null, result];
	} catch (err) {
		return [err as Error, null];
	}
}
