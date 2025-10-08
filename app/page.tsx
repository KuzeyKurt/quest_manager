import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Users, BarChart3, Layers } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6" />
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              Manage tasks with your team, effortlessly
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              A powerful task management platform that helps teams collaborate, track progress, and achieve their goals
              with intuitive drag-and-drop boards and real-time analytics.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8">
                  Start for free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/40 py-24">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-3xl font-bold mb-12">Everything you need to stay organized</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Task Management</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create, organize, and track tasks with drag-and-drop simplicity
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Work together seamlessly with team workspaces and permissions
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Аналитика</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Gain insights with powerful analytics and progress tracking
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Kanban Boards</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Visualize workflow with customizable kanban-style boards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
