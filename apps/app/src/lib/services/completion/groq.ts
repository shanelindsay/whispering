import { Err, Ok } from '@epicenterhq/result';
import { z } from 'zod';
import type { HttpService } from '$lib/services/http/_types';
import type { CompletionService } from './_types';

export function createGroqCompletionService({
	apiKey,
	HttpService,
}: {
	apiKey: string;
	HttpService: HttpService;
}): CompletionService {
	return {
		complete: async ({ model, systemPrompt, userPrompt }) => {
			const { data: httpResponse, error: httpError } = await HttpService.post({
				url: 'https://api.groq.com/openai/v1/chat/completions',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt },
					],
				}),
				schema: z.object({
					choices: z.array(
						z.object({
							message: z.object({
								content: z.string(),
							}),
						}),
					),
				}),
			});

			if (httpError) {
				return Err({
					name: 'CompletionServiceError',
					message: httpError.message,
					context: {},
					cause: httpError,
				});
			}

			const responseText = httpResponse.choices[0]?.message?.content;
			if (!responseText) {
				return Err({
					name: 'CompletionServiceError',
					message: 'Groq API returned an empty response',
					context: {},
					cause: httpError,
				});
			}

			return Ok(responseText);
		},
	};
}
