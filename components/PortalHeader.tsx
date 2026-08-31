export function PortalHeader({kicker,title,copy,action}:{kicker:string,title:string,copy?:string,action?:React.ReactNode}){
  return <div className="portal-header enterprise-page-header">
    <div className="enterprise-page-heading"><div className="kicker">{kicker}</div><h1>{title}</h1>{copy&&<p>{copy}</p>}</div>
    {action&&<div className="enterprise-page-action">{action}</div>}
  </div>
}
