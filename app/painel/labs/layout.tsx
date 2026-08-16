import { PanelSectionShell } from '@/components/PanelSectionShell'

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <PanelSectionShell>{children}</PanelSectionShell>
}
