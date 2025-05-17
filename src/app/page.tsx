import { PlantIdentifierForm } from "@/components/plant-identifier-form";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          Welcome to LeafWise
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Discover the fascinating world of plants. Enter a plant name below to get its description and care tips.
        </p>
      </div>
      <PlantIdentifierForm />
    </section>
  );
}
