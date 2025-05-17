
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Video, UploadCloud, AlertCircle } from 'lucide-react';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { PlantInfoDisplay } from '@/components/plant-info-display';
import { generatePlantDescription, type GeneratePlantDescriptionOutput } from '@/ai/flows/generate-plant-description';
import { generatePlantCareTips, type GeneratePlantCareTipsOutput } from '@/ai/flows/generate-plant-care-tips';
// We'll create this flow in a moment
// import { identifyPlantFromImage, type IdentifyPlantFromImageInput, type IdentifyPlantFromImageOutput } from '@/ai/flows/identify-plant-from-image';

const formSchema = z.object({
  plantName: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }).optional(), // Making plantName optional if image is provided
  plantImage: z.custom<File>((val) => val instanceof File, "Please upload an image file.").optional(),
}).refine(data => data.plantName || data.plantImage, {
  message: "Either plant name or plant image must be provided.",
  path: ["plantName"], // You can also set this to a general form error
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
    defaultValues: {
      plantName: "",
    },
  });

  useEffect(() => {
    if (selectedImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedImageFile);
      form.setValue("plantImage", selectedImageFile);
      form.clearErrors("plantName"); // Clear error if image is now provided
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
          setShowCamera(false); // Hide camera view if permission denied
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      } else {
        // Stop camera stream when not shown
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    };
    getCameraPermission();
    // Cleanup function to stop camera when component unmounts or showCamera changes
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast]);


  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
    setShowCamera(false); // Hide camera if file is uploaded
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

    let plantNameToIdentify = values.plantName;
    let identifiedPlantScientificName = values.plantName || "Unknown Plant";
    let identifiedPlantFamily = "To be determined";

    try {
      // If an image is provided, try to identify it first (placeholder for now)
      if (selectedImageFile && selectedImageUrl) {
        // Placeholder for actual AI image identification:
        // const imageDataUri = selectedImageUrl; // This is already a data URI
        // const imageIdentificationResult = await identifyPlantFromImage({ photoDataUri: imageDataUri });
        // if (imageIdentificationResult?.identification?.commonName) {
        //   plantNameToIdentify = imageIdentificationResult.identification.commonName;
        //   identifiedPlantScientificName = imageIdentificationResult.identification.latinName || plantNameToIdentify;
        //   identifiedPlantFamily = imageIdentificationResult.identification.family || "N/A";
        //   form.setValue("plantName", plantNameToIdentify); // Update form if AI identified a name
        //   toast({ title: "Plant Identified from Image!", description: `Identified as ${plantNameToIdentify}. Fetching details...`});
        // } else {
        //   toast({ title: "Image Identification Note", description: "Could not identify plant from image. Using provided name or default.", variant: "default" });
        // }
         toast({ title: "Image Submitted", description: "Image processing is a TODO. Using text input if available.", variant: "default" });
      }
      
      if (!plantNameToIdentify && !selectedImageFile) {
         toast({
          title: "Input Required",
          description: "Please enter a plant name or upload an image.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Fallback to entered name if no image or image identification fails
      if (!plantNameToIdentify && selectedImageFile) {
        plantNameToIdentify = "Plant from Image"; // Generic name if only image is provided and no AI
      }


      if(!plantNameToIdentify) {
        // This case should ideally be caught by form validation, but as a safeguard:
        toast({
          title: "Missing Information",
          description: "Please provide a plant name or image.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }


      const descriptionOutput = await generatePlantDescription({
        plantName: plantNameToIdentify,
        scientificName: identifiedPlantScientificName,
        family: identifiedPlantFamily,
      });

      if (!descriptionOutput || !descriptionOutput.description) {
        throw new Error("Failed to generate plant description.");
      }
      
      const careTipsOutput = await generatePlantCareTips({
        plantName: plantNameToIdentify,
        plantDescription: descriptionOutput.description,
      });

      setPlantData({
        plantName: plantNameToIdentify,
        scientificName: identifiedPlantScientificName,
        family: identifiedPlantFamily,
        descriptionData: descriptionOutput,
        careTipsData: careTipsOutput,
        imageUrl: selectedImageUrl // Keep displaying the selected/captured image
      });

      toast({
        title: "Plant Info Ready!",
        description: `Details for ${plantNameToIdentify} are now available.`,
        variant: "default",
      });

    } catch (error) {
      console.error("Error processing plant info:", error);
      toast({
        title: "Error",
        description: "Could not fetch plant details. Please try again.",
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
          <FormField
            control={form.control}
            name="plantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Plant Name (Optional if image provided)</FormLabel>
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
          {/* Hidden field for image, handled by ImagePlaceholder logic */}
          <FormField control={form.control} name="plantImage" render={({ field }) => <FormItem><FormControl><input type="hidden" {...field} /></FormControl><FormMessage /></FormItem>} />
          
          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Get Plant Info
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
            imageUrl={plantData.imageUrl}
          />
        </div>
      )}
    </div>
  );
}
