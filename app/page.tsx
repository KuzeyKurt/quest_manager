import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Users, BarChart3, Layers } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pl-20 pr-20">
        <div className="container flex h-16 items-center justify-between pr-10">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6" />
            <span className="text-xl mx-auto font-bold">TaskForce</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Начать</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 md:py-32 mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              Управляйте задачами вместе со своей командой без усилий
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              Мощная платформа для управления задачами, которая помогает командам сотрудничать, отслеживать прогресс и достигать своих целей с помощью интуитивно понятных досок с функцией перетаскивания и аналитики в реальном времени.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8">
                  Начать бесплатно
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/40 mx-auto py-24 mx-auto">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-3xl font-bold mb-12">Все, что вам нужно, чтобы оставаться организованным</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Управление задачами</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Создавайте, организуйте и отслеживайте задачи с помощью простого перетаскивания
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Командное сотрудничество</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Эффективная совместная работа с использованием рабочих пространств и разрешений для команды
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Аналитика</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Получайте информацию с помощью мощной аналитики и отслеживания прогресса
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Канбан доски</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Визуализируйте рабочий процесс с помощью настраиваемых досок в стиле канбан
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mx-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 TaskForce. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}
