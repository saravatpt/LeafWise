
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Video, UploadCloud, AlertCircle, Leaf } from 'lucide-react';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { PlantInfoDisplay } from '@/components/plant-info-display';
import { generatePlantDescription, type GeneratePlantDescriptionOutput } from '@/ai/flows/generate-plant-description';
import { generatePlantCareTips, type GeneratePlantCareTipsOutput } from '@/ai/flows/generate-plant-care-tips';
import { identifyPlantFromImage, type IdentifyPlantFromImageOutput } from '@/ai/flows/identify-plant-from-image';

const formSchema = z.object({
  plantImage: z.custom<File>((val) => val instanceof File, "Please upload an image file."),
});

interface PlantData {
  plantName: string;
  scientificName?: string;
  family?: string;
  descriptionData?: GeneratePlantDescriptionOutput;
  careTipsData?: GeneratePlantCareTipsOutput;
  imageUrl?: string;
}

export function PlantIdentifierForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (selectedImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedImageFile);
      form.setValue("plantImage", selectedImageFile);
      form.clearErrors("plantImage"); 
    } else {
      setSelectedImageUrl(null);
      form.setValue("plantImage", undefined);
    }
  }, [selectedImageFile, form]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (showCamera) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setShowCamera(false); 
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      } else {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    };
    getCameraPermission();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast]);


  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
    setShowCamera(false); 
  };

  const captureImageFromVideo = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.png", { type: "image/png" });
            setSelectedImageFile(file);
            setShowCamera(false);
          }
        }, "image/png");
      }
    } else {
       toast({
        title: "Camera Not Ready",
        description: "Please wait for the camera to initialize or try again.",
        variant: "destructive",
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPlantData(null);

    if (!selectedImageFile || !selectedImageUrl) {
      toast({
        title: "Image Required",
        description: "Please upload or capture an image of the plant.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    let plantNameToIdentify = "Identified Plant"; // Default if AI fails partially
    let identifiedPlantScientificName = "N/A";
    let identifiedPlantFamily = "N/A";

    try {
      const imageDataUri = selectedImageUrl; // This is already a data URI
      
      toast({ title: "Identifying Plant...", description: "Please wait while we analyze the image."});
      const imageIdentificationResult: IdentifyPlantFromImageOutput = await identifyPlantFromImage({ photoDataUri: imageDataUri });

      if (!imageIdentificationResult?.identification?.isPlant) {
        toast({ title: "Not a Plant?", description: "We couldn't identify a plant in the image. Please try another image.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      if (imageIdentificationResult.identification.commonName) {
        plantNameToIdentify = imageIdentificationResult.identification.commonName;
        identifiedPlantScientificName = imageIdentificationResult.identification.latinName || "N/A";
        identifiedPlantFamily = imageIdentificationResult.identification.family || "N/A";
        toast({ title: "Plant Identified!", description: `Identified as ${plantNameToIdentify}. Fetching details...`});
      } else {
        toast({ title: "Identification Unclear", description: "Could not confidently identify the plant species. Displaying generic information if possible.", variant: "default" });
        // We can still try to get generic description/care tips if it's a plant but not specifically named
        plantNameToIdentify = "Plant (species unclear)";
      }
      
      const descriptionOutput = await generatePlantDescription({
        plantName: plantNameToIdentify,
        scientificName: identifiedPlantScientificName,
        family: identifiedPlantFamily,
      });

      if (!descriptionOutput || !descriptionOutput.description) {
        // Don't throw an error here, as care tips might still be generated
        toast({ title: "Description Note", description: "Could not generate a detailed plant description.", variant: "default" });
      }
      
      const careTipsOutput = await generatePlantCareTips({
        plantName: plantNameToIdentify,
        plantDescription: descriptionOutput?.description || "A plant identified from an image.",
      });

      setPlantData({
        plantName: plantNameToIdentify,
        scientificName: identifiedPlantScientificName,
        family: identifiedPlantFamily,
        descriptionData: descriptionOutput,
        careTipsData: careTipsOutput,
        imageUrl: selectedImageUrl 
      });

      if (descriptionOutput?.description || careTipsOutput?.wateringFrequency) {
         toast({
          title: "Plant Info Ready!",
          description: `Details for ${plantNameToIdentify} are now available.`,
          variant: "default",
        });
      } else {
         toast({
          title: "Limited Info",
          description: `We found some basic info for ${plantNameToIdentify}.`,
          variant: "default",
        });
      }


    } catch (error) {
      console.error("Error processing plant info:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching plant details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      {!showCamera && (
        <ImagePlaceholder onImageSelect={handleImageSelect} currentImage={selectedImageUrl} />
      )}

      {showCamera && (
        <div className="space-y-4">
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted shadow-inner" autoPlay muted playsInline />
          {hasCameraPermission === false && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature. You might need to refresh the page.
              </AlertDescription>
            </Alert>
          )}
           {hasCameraPermission === undefined && (
             <Alert variant="default">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Initializing Camera</AlertTitle>
              <AlertDescription>
                Please wait while we access your camera. You may need to grant permission.
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={captureImageFromVideo} className="w-full" disabled={!hasCameraPermission || isLoading}>
            <Video className="mr-2" /> Capture Image
          </Button>
        </div>
      )}

      <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => setShowCamera(false)} disabled={!showCamera || isLoading}>
            <UploadCloud className="mr-2"/> Upload File
          </Button>
          <Button variant="outline" onClick={() => setShowCamera(true)} disabled={showCamera || isLoading}>
            <Video className="mr-2"/> Use Camera
          </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 sm:p-8 rounded-lg shadow-md">
          {/* Hidden field for image, handled by ImagePlaceholder logic */}
          <FormField 
            control={form.control} 
            name="plantImage" 
            render={({ field }) => (
              <FormItem className="hidden"> {/* Visually hide, but keep for form state */}
                <FormControl><input type="file" {...field} value={undefined} /></FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <Button 
            type="submit" 
            className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" 
            disabled={isLoading || !selectedImageFile}
            aria-label="Get plant information from uploaded image"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Leaf className="mr-2 h-5 w-5" />
                Identify My Plant
              </>
            )}
          </Button>
          {!selectedImageFile && !isLoading && (
            <p className="text-sm text-muted-foreground text-center">Please select or capture an image first.</p>
          )}
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
            imageUrl={plantData.imageUrl}
          />
        </div>
      )}
    </div>
  );
}
