'use server';

/**
 * @fileOverview Flow to generate personalized care tips for a given plant.
 *
 * - generatePlantCareTips - A function that generates plant care tips.
 * - GeneratePlantCareTipsInput - The input type for the generatePlantCareTips function.
 * - GeneratePlantCareTipsOutput - The return type for the generatePlantCareTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlantCareTipsInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  plantDescription: z.string().describe('A detailed description of the plant.'),
});
export type GeneratePlantCareTipsInput = z.infer<typeof GeneratePlantCareTipsInputSchema>;

const GeneratePlantCareTipsOutputSchema = z.object({
  wateringFrequency: z.string().describe('Recommended watering frequency for the plant.'),
  sunlightRequirements: z.string().describe('Sunlight requirements for the plant.'),
  additionalCareTips: z.string().describe('Any additional care tips for the plant.'),
});
export type GeneratePlantCareTipsOutput = z.infer<typeof GeneratePlantCareTipsOutputSchema>;

export async function generatePlantCareTips(input: GeneratePlantCareTipsInput): Promise<GeneratePlantCareTipsOutput> {
  return generatePlantCareTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlantCareTipsPrompt',
  input: {schema: GeneratePlantCareTipsInputSchema},
  output: {schema: GeneratePlantCareTipsOutputSchema},
  prompt: `You are an expert botanist specializing in providing care tips for plants.

  Based on the provided plant name and description, generate personalized care tips, including watering frequency, sunlight requirements, and any additional care tips.

  Plant Name: {{{plantName}}}
  Plant Description: {{{plantDescription}}}
  `,
});

const generatePlantCareTipsFlow = ai.defineFlow(
  {
    name: 'generatePlantCareTipsFlow',
    inputSchema: GeneratePlantCareTipsInputSchema,
    outputSchema: GeneratePlantCareTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
