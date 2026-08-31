export function StatusPill({children,tone='green'}:{children:React.ReactNode,tone?:'green'|'warning'|'danger'|'cyan'}){
  return <span className={`status-pill ${tone}`}><i aria-hidden="true"/>{children}</span>
}
