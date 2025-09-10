'use server';

/**
 * @fileOverview An AI agent for classifying video content into predefined categories.
 *
 * - classifyVideoContent - A function that classifies video content.
 * - ClassifyVideoContentInput - The input type for the classifyVideoContent function.
 * - ClassifyVideoContentOutput - The return type for the classifyVideoContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyVideoContentInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('A detailed description of the video content.'),
});
export type ClassifyVideoContentInput = z.infer<typeof ClassifyVideoContentInputSchema>;

const ClassifyVideoContentOutputSchema = z.object({
  category: z.string().describe('The predicted category of the video content.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type ClassifyVideoContentOutput = z.infer<typeof ClassifyVideoContentOutputSchema>;

export async function classifyVideoContent(
  input: ClassifyVideoContentInput
): Promise<ClassifyVideoContentOutput> {
  return classifyVideoContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyVideoContentPrompt',
  input: {schema: ClassifyVideoContentInputSchema},
  output: {schema: ClassifyVideoContentOutputSchema},
  prompt: `You are an expert in video content classification.
  Given the title and description of a video, you will determine the most appropriate category for the video.
  You will also provide a confidence level for your prediction.

  Available Categories:
  - Educational
  - Entertainment
  - Sports
  - News
  - Music
  - Gaming
  - Technology
  - Travel
  - How-to
  - Other

  Title: {{{title}}}
  Description: {{{description}}}

  Please provide the category and confidence level in JSON format.`,
});

const classifyVideoContentFlow = ai.defineFlow(
  {
    name: 'classifyVideoContentFlow',
    inputSchema: ClassifyVideoContentInputSchema,
    outputSchema: ClassifyVideoContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
