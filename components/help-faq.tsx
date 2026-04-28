"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SidebarTrigger } from "@/components/ui/sidebar"

const faqs: { q: string; a: string }[] = [
  {
    q: "Что такое проект в TaskForce?",
    a: "Проект — это рабочее пространство для команды: внутри него доска задач, участники и аналитика. Создайте проект на главной странице («Мои проекты»), затем откройте его, чтобы вести задачи.",
  },
  {
    q: "Как пригласить людей в команду?",
    a: "Откройте проект и перейдите на вкладку «Участники». Администратор проекта может управлять составом команды. Точные шаги приглашения зависят от настроек вашей организации.",
  },
  {
    q: "Как менять порядок задач?",
    a: "На доске задач перетащите карточки — порядок сохраняется автоматически. Если что-то не перемещается, обновите страницу и проверьте подключение к сети.",
  },
  {
    q: "Где посмотреть аналитику по проекту?",
    a: "Внутри открытого проекта откройте вкладку «Аналитика» — там сводные показатели по задачам и команде.",
  },
  {
    q: "Как выйти из аккаунта?",
    a: "Внизу боковой панели нажмите «Выход». Вы также можете закрыть сессию, очистив cookies сайта в настройках браузера.",
  },
  {
    q: "Забыл пароль — что делать?",
    a: "На странице входа используйте восстановление пароля, если оно включено. Иначе обратитесь к администратору системы или в поддержку вашей организации.",
  },
]

export function HelpFaq() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
      </header>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Помощь</h1>
        <p className="mt-2 text-muted-foreground">
          Ответы на частые вопросы по TaskForce
        </p>

        <Accordion type="single" collapsible className="mt-8 w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  )
}
