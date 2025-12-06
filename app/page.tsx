import { SearchForm } from "@/components/search-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">LeadRadar</h1>
          <p className="text-muted-foreground mt-1">AI-powered lead generation with Google Maps</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SearchForm />
      </main>
    </div>
  )
}
