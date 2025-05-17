
import { PlantIdentifierForm } from "@/components/plant-identifier-form";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
          Welcome to LeafWise
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl lg:max-w-2xl mx-auto">
          Snap a photo or use your camera. LeafWise will identify the plant, provide details, and offer care tips.
        </p>
      </div>
      <PlantIdentifierForm />
    </section>
  );
}
