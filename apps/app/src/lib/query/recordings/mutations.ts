import { queryClient } from '$lib/query';
import type { Recording } from '$lib/services/db';
import {
	DbRecordingsService,
	createResultMutation,
} from '$lib/services/index.js';
import { toast } from '$lib/services/toast';
import { Err, Ok } from '@epicenterhq/result';
import type { WhisperingError } from '@repo/shared';
import { recordingsKeys } from './queries';

export function useCreateRecording() {
	return {
		createRecording: createResultMutation(() => ({
			mutationFn: async (recording: Recording) => {
				const { error: createRecordingError } =
					await DbRecordingsService.createRecording(recording);
				if (createRecordingError) {
					return Err({
						name: 'WhisperingError',
						title: 'Failed to update recording!',
						description: 'Your recording could not be updated.',
						action: { type: 'more-details', error: createRecordingError },
						context: { recording },
						cause: createRecordingError,
					} satisfies WhisperingError);
				}

				queryClient.setQueryData<Recording[]>(recordingsKeys.all, (oldData) => {
					if (!oldData) return [recording];
					return [...oldData, recording];
				});
				queryClient.setQueryData<Recording>(
					recordingsKeys.byId(recording.id),
					recording,
				);
				queryClient.invalidateQueries({
					queryKey: recordingsKeys.latest,
				});

				return Ok(recording);
			},
		})),
	};
}

export function useUpdateRecording() {
	return {
		updateRecording: createResultMutation(() => ({
			mutationFn: async (recording: Recording) => {
				const { error: updateRecordingError } =
					await DbRecordingsService.updateRecording(recording);
				if (updateRecordingError) {
					return Err({
						name: 'WhisperingError',
						title: 'Failed to update recording!',
						description: 'Your recording could not be updated.',
						action: { type: 'more-details', error: updateRecordingError },
						context: { recording },
						cause: updateRecordingError,
					} satisfies WhisperingError);
				}

				queryClient.setQueryData<Recording[]>(recordingsKeys.all, (oldData) => {
					if (!oldData) return [recording];
					return oldData.map((item) =>
						item.id === recording.id ? recording : item,
					);
				});
				queryClient.setQueryData<Recording>(
					recordingsKeys.byId(recording.id),
					recording,
				);
				queryClient.invalidateQueries({
					queryKey: recordingsKeys.latest,
				});

				return Ok(recording);
			},
		})),
	};
}

export function useUpdateRecordingWithToast() {
	return {
		updateRecordingWithToast: createResultMutation(() => ({
			mutationFn: async (recording: Recording) => {
				const { error: updateRecordingError } =
					await DbRecordingsService.updateRecording(recording);
				if (updateRecordingError) {
					const whisperingError = {
						name: 'WhisperingError',
						title: 'Failed to update recording!',
						description: 'Your recording could not be updated.',
						action: { type: 'more-details', error: updateRecordingError },
						context: { recording },
						cause: updateRecordingError,
					} satisfies WhisperingError;
					toast.error(whisperingError);
					return Err(whisperingError);
				}

				queryClient.setQueryData<Recording[]>(recordingsKeys.all, (oldData) => {
					if (!oldData) return [recording];
					return oldData.map((item) =>
						item.id === recording.id ? recording : item,
					);
				});
				queryClient.setQueryData<Recording>(
					recordingsKeys.byId(recording.id),
					recording,
				);
				queryClient.invalidateQueries({
					queryKey: recordingsKeys.latest,
				});

				toast.success({
					title: 'Updated recording!',
					description: 'Your recording has been updated successfully.',
				});

				return Ok(recording);
			},
		})),
	};
}

export function useDeleteRecordingWithToast() {
	return {
		deleteRecordingWithToast: createResultMutation(() => ({
			mutationFn: async (recording: Recording) => {
				const { error: deleteRecordingError } =
					await DbRecordingsService.deleteRecording(recording);
				if (deleteRecordingError) {
					const whisperingError = {
						name: 'WhisperingError',
						title: 'Failed to delete recording!',
						description: 'Your recording could not be deleted.',
						action: { type: 'more-details', error: deleteRecordingError },
						context: { recording },
						cause: deleteRecordingError,
					} satisfies WhisperingError;
					toast.error(whisperingError);
					return Err(whisperingError);
				}
				queryClient.setQueryData<Recording[]>(recordingsKeys.all, (oldData) => {
					if (!oldData) return [];
					return oldData.filter((item) => item.id !== recording.id);
				});
				queryClient.removeQueries({
					queryKey: recordingsKeys.byId(recording.id),
				});
				queryClient.invalidateQueries({
					queryKey: recordingsKeys.latest,
				});

				toast.success({
					title: 'Deleted recording!',
					description: 'Your recording has been deleted successfully.',
				});

				return Ok(recording);
			},
		})),
	};
}

export function useDeleteRecordingsWithToast() {
	return {
		deleteRecordingsWithToast: createResultMutation(() => ({
			mutationFn: async (recordings: Recording[]) => {
				const { error: deleteRecordingsError } =
					await DbRecordingsService.deleteRecordings(recordings);
				if (deleteRecordingsError) {
					const whisperingError = {
						name: 'WhisperingError',
						title: 'Failed to delete recordings!',
						description: 'Your recordings could not be deleted.',
						action: { type: 'more-details', error: deleteRecordingsError },
						context: { recordings },
						cause: deleteRecordingsError,
					} satisfies WhisperingError;
					toast.error(whisperingError);
					return Err(whisperingError);
				}

				queryClient.setQueryData<Recording[]>(recordingsKeys.all, (oldData) => {
					if (!oldData) return [];
					const deletedIds = new Set(recordings.map((r) => r.id));
					return oldData.filter((item) => !deletedIds.has(item.id));
				});
				for (const recording of recordings) {
					queryClient.removeQueries({
						queryKey: recordingsKeys.byId(recording.id),
					});
				}
				queryClient.invalidateQueries({
					queryKey: recordingsKeys.latest,
				});

				toast.success({
					title: 'Deleted recordings!',
					description: 'Your recordings have been deleted successfully.',
				});

				return Ok(recordings);
			},
		})),
	};
}
