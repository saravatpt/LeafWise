import type { GeneratePlantDescriptionOutput } from '@/ai/flows/generate-plant-description';
import type { GeneratePlantCareTipsOutput } from '@/ai/flows/generate-plant-care-tips';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Droplets, Info, Sun, Leaf } from 'lucide-react';

interface PlantInfoProps {
  plantName: string;
  scientificName?: string;
  family?: string;
  descriptionData?: GeneratePlantDescriptionOutput;
  careTipsData?: GeneratePlantCareTipsOutput;
}

export function PlantInfoDisplay({ plantName, scientificName, family, descriptionData, careTipsData }: PlantInfoProps) {
  if (!descriptionData && !careTipsData) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-primary/10 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Leaf className="w-10 h-10 text-primary" />
          <div>
            <CardTitle className="text-3xl font-bold text-primary">{plantName}</CardTitle>
            {(scientificName || family) && (
              <CardDescription className="text-sm text-primary/80">
                {scientificName && <span>Scientific Name: <em>{scientificName}</em></span>}
                {scientificName && family && " | "}
                {family && <span>Family: {family}</span>}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion type="multiple" defaultValue={['description', 'care-tips']} className="w-full">
          {descriptionData?.description && (
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-semibold hover:text-accent">
                <Info className="w-5 h-5 mr-2 text-accent" /> Description
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 prose dark:prose-invert">
                {descriptionData.description}
              </AccordionContent>
            </AccordionItem>
          )}
          {careTipsData && (
            <AccordionItem value="care-tips">
              <AccordionTrigger className="text-lg font-semibold hover:text-accent">
                 <Leaf className="w-5 h-5 mr-2 text-accent" /> Care Tips
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-foreground/80">
                {careTipsData.wateringFrequency && (
                  <div className="flex items-start gap-2">
                    <Droplets className="w-5 h-5 mt-1 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-accent">Watering Frequency:</h4>
                      <p>{careTipsData.wateringFrequency}</p>
                    </div>
                  </div>
                )}
                {careTipsData.sunlightRequirements && (
                  <div className="flex items-start gap-2">
                    <Sun className="w-5 h-5 mt-1 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-accent">Sunlight Requirements:</h4>
                      <p>{careTipsData.sunlightRequirements}</p>
                    </div>
                  </div>
                )}
                {careTipsData.additionalCareTips && (
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 mt-1 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-accent">Additional Care Tips:</h4>
                      <p>{careTipsData.additionalCareTips}</p>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
