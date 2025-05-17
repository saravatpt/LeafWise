'use server';

/**
 * @fileOverview Generates a short, informative description of a plant based on its identified species.
 *
 * - generatePlantDescription - A function that generates a plant description.
 * - GeneratePlantDescriptionInput - The input type for the generatePlantDescription function.
 * - GeneratePlantDescriptionOutput - The return type for the generatePlantDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlantDescriptionInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  scientificName: z.string().describe('The scientific name of the plant.'),
  family: z.string().describe('The family of the plant.'),
});
export type GeneratePlantDescriptionInput = z.infer<typeof GeneratePlantDescriptionInputSchema>;

const GeneratePlantDescriptionOutputSchema = z.object({
  description: z.string().describe('A short, informative description of the plant.'),
});
export type GeneratePlantDescriptionOutput = z.infer<typeof GeneratePlantDescriptionOutputSchema>;

export async function generatePlantDescription(input: GeneratePlantDescriptionInput): Promise<GeneratePlantDescriptionOutput> {
  return generatePlantDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlantDescriptionPrompt',
  input: {schema: GeneratePlantDescriptionInputSchema},
  output: {schema: GeneratePlantDescriptionOutputSchema},
  prompt: `You are an expert botanist. Generate a short, informative description of the following plant, including its key characteristics and uses.

Plant Name: {{{plantName}}}
Scientific Name: {{{scientificName}}}
Family: {{{family}}}`,
});

const generatePlantDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePlantDescriptionFlow',
    inputSchema: GeneratePlantDescriptionInputSchema,
    outputSchema: GeneratePlantDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
