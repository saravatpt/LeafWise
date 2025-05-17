
'use server';
/**
 * @fileOverview A Genkit flow to identify a plant from an image.
 *
 * - identifyPlantFromImage - A function that identifies a plant using an image.
 * - IdentifyPlantFromImageInput - The input type for the identifyPlantFromImage function.
 * - IdentifyPlantFromImageOutput - The return type for the identifyPlantFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantFromImageInput = z.infer<typeof IdentifyPlantFromImageInputSchema>;

const IdentifyPlantFromImageOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input image contains a plant.'),
    commonName: z.string().describe('The common name of the identified plant. Empty if not a plant or not identifiable.'),
    latinName: z.string().describe('The Latin name (scientific name) of the identified plant. Empty if not a plant or not identifiable.'),
    family: z.string().describe('The family of the identified plant. Empty if not a plant or not identifiable.'),
  }),
});
export type IdentifyPlantFromImageOutput = z.infer<typeof IdentifyPlantFromImageOutputSchema>;

export async function identifyPlantFromImage(input: IdentifyPlantFromImageInput): Promise<IdentifyPlantFromImageOutput> {
  return identifyPlantFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantFromImagePrompt',
  input: {schema: IdentifyPlantFromImageInputSchema},
  output: {schema: IdentifyPlantFromImageOutputSchema},
  prompt: `You are an expert botanist. Analyze the provided image.
Determine if the image contains a plant.
If it is a plant, identify its common name, Latin (scientific) name, and family.
If it is not a plant or cannot be reliably identified, indicate that.

Image: {{media url=photoDataUri}}`,
});

const identifyPlantFromImageFlow = ai.defineFlow(
  {
    name: 'identifyPlantFromImageFlow',
    inputSchema: IdentifyPlantFromImageInputSchema,
    outputSchema: IdentifyPlantFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
