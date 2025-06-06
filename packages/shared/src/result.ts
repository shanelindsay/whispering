import type { Err, Ok, TaggedError } from '@epicenterhq/result';
import type { ToastAndNotifyOptions } from './toasts.js';

export type WhisperingWarning = Omit<
	TaggedError<'WhisperingWarning'>,
	'message'
> &
	Omit<ToastAndNotifyOptions, 'variant'>;

export type WhisperingError = Omit<TaggedError<'WhisperingError'>, 'message'> &
	Omit<ToastAndNotifyOptions, 'variant'>;

export type WhisperingErr = Err<WhisperingError>;
export type WhisperingResult<T> = Ok<T> | WhisperingErr;

export type MaybePromise<T> = T | Promise<T>;

export const WhisperingWarningProperties = (
	args: Omit<WhisperingWarning, 'name'>,
): WhisperingWarning => ({
	name: 'WhisperingWarning',
	...args,
});

export const WhisperingError = (
	args: Omit<WhisperingError, 'name'>,
): WhisperingError => ({
	name: 'WhisperingError',
	...args,
});
