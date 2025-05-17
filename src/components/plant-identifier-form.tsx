"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from 'lucide-react';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { PlantInfoDisplay } from '@/components/plant-info-display';
import { generatePlantDescription, type GeneratePlantDescriptionOutput } from '@/ai/flows/generate-plant-description';
import { generatePlantCareTips, type GeneratePlantCareTipsOutput } from '@/ai/flows/generate-plant-care-tips';

const formSchema = z.object({
  plantName: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
});

interface PlantData {
  plantName: string;
  scientificName?: string;
  family?: string;
  descriptionData?: GeneratePlantDescriptionOutput;
  careTipsData?: GeneratePlantCareTipsOutput;
}

export function PlantIdentifierForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPlantData(null); // Clear previous results

    try {
      // Simulate scientific name and family for the AI flow
      const simulatedScientificName = values.plantName; // Use common name as scientific for now
      const simulatedFamily = "To be determined"; // Placeholder

      const descriptionOutput = await generatePlantDescription({
        plantName: values.plantName,
        scientificName: simulatedScientificName,
        family: simulatedFamily,
      });

      if (!descriptionOutput || !descriptionOutput.description) {
        throw new Error("Failed to generate plant description.");
      }
      
      const careTipsOutput = await generatePlantCareTips({
        plantName: values.plantName,
        plantDescription: descriptionOutput.description,
      });

      setPlantData({
        plantName: values.plantName,
        scientificName: simulatedScientificName, // Display the simulated one
        family: simulatedFamily, // Display the simulated one
        descriptionData: descriptionOutput,
        careTipsData: careTipsOutput,
      });

      toast({
        title: "Plant Identified!",
        description: `Details for ${values.plantName} are now available.`,
        variant: "default",
      });

    } catch (error) {
      console.error("Error identifying plant:", error);
      toast({
        title: "Error",
        description: "Could not identify plant or fetch details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <ImagePlaceholder />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 sm:p-8 rounded-lg shadow-md">
          <FormField
            control={form.control}
            name="plantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Plant Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Sunflower, Rose, Ficus" 
                    {...field} 
                    className="text-base py-3 px-4"
                    aria-label="Enter plant name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Identifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Identify Plant & Get Info
              </>
            )}
          </Button>
        </form>
      </Form>

      {plantData && (
        <div className="mt-10">
          <PlantInfoDisplay 
            plantName={plantData.plantName}
            scientificName={plantData.scientificName}
            family={plantData.family}
            descriptionData={plantData.descriptionData}
            careTipsData={plantData.careTipsData}
          />
        </div>
      )}
    </div>
  );
}
