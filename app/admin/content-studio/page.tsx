import { redirect } from 'next/navigation'

export default function LegacyContentStudio() {
  redirect('/admin?view=courses')
}
