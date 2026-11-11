let previous = 0;
async function update(){
 try {
  const r=await fetch('/api/events',{cache:'no-store'}); if(!r.ok)throw Error('offline');
  const data=await r.json(); const count=data.count;
  document.getElementById('count').textContent=count;
  if(count>previous){
   for(let i=0;i<Math.min(count-previous,8);i++){
    const e=document.createElement('div');e.className='flash';
    document.getElementById('pulse').append(e);setTimeout(()=>e.remove(),1100);
   }
   document.getElementById('last').textContent=new Date().toLocaleTimeString('pt-BR');
  }
  previous=count;
  document.getElementById('state').textContent=count?'EVENTOS RECEBIDOS':'AGUARDANDO EVENTOS';
 } catch {document.getElementById('state').textContent='SEM CONEXÃO';}
}
update();setInterval(update,1500);
