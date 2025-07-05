import browser from "webextension-polyfill";

/**
 * Returns a Promise that resolves after a specified amount of time.
 */
export function waitForTime(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Waits for a condition to become true within a specified timeout period.
 *
 * @returns Promise that resolves when condition is met
 * @throws Error when timeout is reached before condition becomes true
 */
export function waitFor(
	condition: () => boolean,
	description: string,
	timeout = 10000,
	interval = 250,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();

		const checkCondition = () => {
			console.debug("Checking condition...", description);
			if (condition()) {
				console.debug("Condition met, resolving promise.", description);
				resolve();
			} else if (Date.now() - startTime >= timeout) {
				console.debug("Timeout reached, rejecting promise.", description);
				reject(
					new Error(
						`Condition not met within timeout period for : ${description}`,
					),
				);
			} else {
				console.debug(
					"Condition not met, checking again in interval.",
					description,
				);
				setTimeout(checkCondition, interval);
			}
		};

		checkCondition();
	});
}

/**
 * Awaits a promise and returns a tuple containing either an error or the result.
 */
export async function perform<T>(
	promise: Promise<T>,
): Promise<[null, T] | [Error, null]> {
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

/**
 * Asserts that the given value is not null or undefined.
 * Throws an error with the provided message if the value is nullish.
 */
export function assertNonNullish(
	value: unknown,
	message: string,
): asserts value {
	if (value === null || value === undefined) {
		throw new Error(message);
	}
}

type OnTabUpdatedListener = Parameters<
	typeof browser.tabs.onUpdated.addListener
>[0];

/**
 * Opens a new tab with the specified URL and waits for it to finish loading.
 *
 * @returns A promise that resolves to the tab object once loading is complete
 * @throws Will reject if there's a runtime error during tab creation or loading
 */
export async function openTab(url: string): Promise<browser.Tabs.Tab> {
	return new Promise((resolve, reject) => {
		browser.tabs.create({ url }).then((openedTab) => {
			const checkTabLoaded: OnTabUpdatedListener = (
				tabId,
				changeInfo,
				updatedTab,
			) => {
				if (browser.runtime.lastError) {
					return reject(new Error(browser.runtime.lastError.message));
				}

				if (tabId === openedTab.id && changeInfo.status === "complete") {
					browser.tabs.onUpdated.removeListener(checkTabLoaded);
					resolve(updatedTab);
				}
			};

			browser.tabs.onUpdated.addListener(checkTabLoaded);
		});
	});
}

/**
 * Extracts the ID from a browser tab object.
 *
 * @returns The numeric ID of the tab
 * @throws Error if the tab is undefined or doesn't have an ID
 */
export function getTabId(tab: browser.Tabs.Tab | undefined): number {
	if (!tab || !tab.id) {
		throw new Error("Tab is not available or does not have an ID.");
	}

	return tab.id;
}
