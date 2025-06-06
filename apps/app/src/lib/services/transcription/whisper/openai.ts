import { Err, Ok } from '@epicenterhq/result';
import type { WhisperingError } from '@repo/shared';
import type { TranscriptionService } from '../_types';
import type { HttpService } from '../../http/_types';
import { createWhisperService } from './_createWhisperService';

export function createOpenaiTranscriptionService({
	HttpService,
	apiKey,
}: {
	HttpService: HttpService;
	apiKey: string;
}): TranscriptionService {
	return createWhisperService({
		HttpService,
		modelName: 'whisper-1',
		postConfig: {
			url: 'https://api.openai.com/v1/audio/transcriptions',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		},
		preValidate: async () => {
			if (!apiKey) {
				return Err({
					name: 'WhisperingError',
					title: '🔑 API Key Required',
					description:
						'Please enter your OpenAI API key in settings to use Whisper transcription.',
					action: {
						type: 'link',
						label: 'Add API key',
						goto: '/settings/transcription',
					},
					context: {},
					cause: undefined,
				} satisfies WhisperingError);
			}

			if (!apiKey.startsWith('sk-')) {
				return Err({
					name: 'WhisperingError',
					title: '🔑 Invalid API Key Format',
					description:
						'Your OpenAI API key should start with "sk-". Please check and update your API key.',
					action: {
						type: 'link',
						label: 'Update API key',
						goto: '/settings/transcription',
					},
					context: {},
					cause: undefined,
				} satisfies WhisperingError);
			}

			return Ok(undefined);
		},
		errorConfig: {
			title: '🔧 OpenAI Service Error',
			description:
				'The OpenAI Whisper service encountered an issue. This is typically a temporary problem on their end.',
		},
	});
}
