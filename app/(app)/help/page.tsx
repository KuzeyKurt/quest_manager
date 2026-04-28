import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { HelpFaq } from "@/components/help-faq"

export default async function HelpPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  return <HelpFaq />
}
