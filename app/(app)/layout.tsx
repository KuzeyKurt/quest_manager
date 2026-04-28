import { LoggedInShell } from "@/components/logged-in-shell"

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LoggedInShell>{children}</LoggedInShell>
}
