import { redirect } from 'next/navigation'

// Rota antiga mantida apenas para compatibilidade com links/bookmarks salvos.
// O Command Center agora vive em /painel, dentro do mesmo layout do menu
// lateral, para que a navegação entre seções nunca precise remontar o shell.
export default function DashboardAlias() {
  redirect('/painel')
}
