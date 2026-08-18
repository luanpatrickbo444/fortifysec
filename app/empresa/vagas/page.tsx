import { redirect } from 'next/navigation'

export default async function LegacyEditCompanyJob({params}:{params:Promise<{id:string}>}){
  const {id}=await params
  redirect(`/empresa/job-console/${id}/editar`)
}
