"use client";

import { useState } from "react";
import { browserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const trails = [
  { n: "01", title: "Fundamentos", desc: "Linux, redes, Python, criptografia e segurança da informação.", tags: ["LINUX", "PYTHON", "REDES"] },
  { n: "02", title: "Offensive Security", desc: "Recon, infraestrutura, web hacking, wireless e cloud pentesting.", tags: ["RECON", "WEB", "CLOUD"] },
  { n: "03", title: "Advanced", desc: "Active Directory, pós-exploração, malware, assembly e exploits.", tags: ["AD", "MALWARE", "EXPLOIT"] },
  { n: "04", title: "Modern Security", desc: "Bug bounty, segurança de IA, LLM hacking, EDR e evasão.", tags: ["AI", "LLM", "EDR"] },
  { n: "05", title: "Hardware", desc: "Eletrônica, firmware, gadgets, chips e side-channel analysis.", tags: ["IOT", "JTAG", "CHIPS"] },
];

const curriculum = [
  { title: "Base técnica", range: "01—07", courses: ["Introdução à FortifySec", "Fundamentos de Segurança da Informação e Pentest", "Dominando o Linux e Shell para Pentesters", "Introdução ao Python e Algoritmos", "Fundamentos de Criptografia e Senhas", "Python Orientado a Objetos e Automação", "Fundamentos de Redes para Pentesters"]},
  { title: "Pentest e infraestrutura", range: "08—15", courses: ["Dominando o Recon em Pentest", "Dominando o Pentest em Infraestrutura de Redes", "Desenvolvimento Web para Pentesters", "Ataque em Redes Wi-Fi", "Segurança em Redes Wi-Fi", "Fundamentos de Eletrônica", "Ataques Denial of Service (DoS) e Botnets", "Ataques Man-in-the-Middle (MITM)"]},
  { title: "Aplicações, cloud e mobile", range: "16—21", courses: ["Ataque em Aplicações Web", "Pentest em Ambientes em Nuvem — Cloud Pentesting", "Pentest em Aplicativos Android", "Desenvolvimento de Malwares para Android", "Automação e Estratégias em Bug Bounty", "Inteligência Artificial para Pentest Web"]},
  { title: "Pós-exploração e hardware", range: "22—29", courses: ["Fundamentos de C para Pentesters", "Pós-exploração no Linux", "Docker para Pentesters", "Metodologias de Pentest na Prática", "Gadgets para Pentest e Red Team", "Exploração de Jogos com Hardware — Game Cheat", "Hardware Hacking na Prática", "Hackeando Chips — Side-Channel Analysis e Fault Injection"]},
  { title: "Red Team e exploit development", range: "30—33", courses: ["Fundamentos de PowerShell para Pentesters", "Pós-exploração Windows e Pentest em Active Directory", "Assembly para Pentesters e Desenvolvimento de Exploits", "Técnicas de Phishing e Engenharia Social"]},
  { title: "Privacidade, IA e malware", range: "34—37", courses: ["Fundamentos de Privacidade e Anonimato", "LLM Hacking — Exploração de IAs", "Análise e Desenvolvimento de Malwares", "Técnicas de Evasão de Antivírus e EDR"]},
];

const faqs = [
  ["Preciso ter experiência prévia?", "Não. A trilha começa nos fundamentos e evolui até técnicas avançadas, com progressão guiada."],
  ["Os laboratórios são reais?", "São ambientes controlados que simulam redes, servidores e aplicações vulneráveis para prática segura e autorizada."],
  ["Como funciona o CTF de R$ 15 mil?", "Participantes elegíveis competem em desafios técnicos. Datas, critérios, premiação e regras serão publicados no regulamento oficial."],
  ["A certificação é prática?", "Sim. A avaliação combina exploração em laboratório, relatório técnico e validação dos resultados."],
];

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function startCheckout() {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const { data } = await browserSupabase().auth.getSession();
      if (!data.session) { router.push("/login"); return; }
      const response = await fetch("/api/checkout", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` } });
      const checkout = await response.json();
      if (!response.ok || !checkout.checkoutUrl) throw new Error(checkout.error || "Não foi possível iniciar o pagamento.");
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.");
      setCheckoutLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="FortifySec início"><span className="brand-mark">F/</span> FORTIFYSEC</a>
        <div className="navlinks"><a href="#formacao">FORMAÇÃO</a><a href="#labs">LABS</a><a href="#ctf">CTF</a><a href="#certificacao">CERTIFICAÇÃO</a></div>
        <a className="nav-cta" href="/login">ÁREA DO ALUNO ↗</a>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><i /> FORMAÇÃO PROFISSIONAL EM CYBERSECURITY <span>{"/// TURMA 01"}</span></div>
        <div className="hero-grid">
          <div>
            <h1>DOMINE<br /><em>CYBER</em><br /><span className="security-word">SECURITY.</span></h1>
            <p className="hero-copy">Aprenda a pensar, testar e agir como um profissional de segurança. Da base ao Red Team, com prática desde o primeiro módulo.</p>
            <div className="actions"><a className="button primary" href="#oferta">QUERO COMEÇAR <span>↗</span></a><a className="button ghost" href="#formacao">EXPLORAR A GRADE ↓</a></div>
          </div>
          <div className="terminal" aria-label="Terminal de demonstração">
            <div className="terminal-top"><span><b /> <b /> <b /></span><small>root@fortifysec:~</small><small>SECURE</small></div>
            <div className="terminal-body">
              <p><span className="muted">01</span> <span className="green">$</span> nmap -sV target.lab</p>
              <p><span className="muted">02</span> Starting security scan...</p>
              <p><span className="muted">03</span> PORT&nbsp;&nbsp;&nbsp;&nbsp;STATE&nbsp;&nbsp;SERVICE</p>
              <p><span className="muted">04</span> 22/tcp&nbsp;&nbsp;<span className="green">open</span>&nbsp;&nbsp;&nbsp;ssh</p>
              <p><span className="muted">05</span> 443/tcp <span className="green">open</span>&nbsp;&nbsp;&nbsp;https</p>
              <p><span className="muted">06</span> <span className="green">$</span> ./exploit --target lab</p>
              <p><span className="muted">07</span> Access granted. Flag found:</p>
              <p className="flag"><span className="muted">08</span> CTF&#123;READY_FOR_THE_REAL_WORLD&#125;</p>
              <p><span className="muted">09</span> <span className="green">$</span> <span className="cursor">_</span></p>
            </div>
            <div className="terminal-foot"><span>● LAB ONLINE</span><span>ENCRYPTED SESSION</span></div>
          </div>
        </div>
        <div className="metrics">
          <div><strong>600<sup>+</sup></strong><span>HORAS DE<br />FORMAÇÃO</span></div>
          <div><strong>37<sup>+</sup></strong><span>ESPECIALIZAÇÕES<br />NA PLATAFORMA</span></div>
          <div><strong>100<sup>%</sup></strong><span>CONTEÚDO<br />PRÁTICO</span></div>
          <div><strong>R$ 15<sup>k</sup></strong><span>PRÊMIO NO<br />CTF</span></div>
        </div>
      </section>

      <section className="section shell" id="formacao">
        <div className="section-head"><div><span className="kicker">{"// SUA JORNADA"}</span><h2>UMA FORMAÇÃO.<br /><em>CINCO TRILHAS.</em></h2></div><p>Uma progressão estruturada para transformar curiosidade em competência técnica comprovada.</p></div>
        <div className="trail-list">{trails.map((t) => <article className="trail" key={t.n}><span className="trail-n">{t.n}</span><div><h3>{t.title}</h3><p>{t.desc}</p></div><div className="tags">{t.tags.map(x => <span key={x}>{x}</span>)}</div><span className="arrow">↗</span></article>)}</div>
        <div className="curriculum-head"><div><span className="kicker">{"// GRADE COMPLETA"}</span><h2>37 CURSOS.<br /><em>633 HORAS.</em></h2></div><p>Conteúdo organizado do nível fundamental ao avançado. Cada etapa combina teoria objetiva, demonstrações e prática em ambiente controlado.</p></div>
        <div className="curriculum">{curriculum.map((group, groupIndex) => {
          const before = curriculum.slice(0, groupIndex).reduce((sum, item) => sum + item.courses.length, 0);
          return <article className="course-group" key={group.title}><header><span>{group.range}</span><h3>{group.title}</h3><small>{group.courses.length} CURSOS</small></header><ol>{group.courses.map((course, courseIndex) => <li key={course}><b>{String(before + courseIndex + 1).padStart(2,"0")}</b><span>{course}</span><i>↗</i></li>)}</ol></article>
        })}</div>
      </section>

      <section className="labs" id="labs"><div className="shell labs-grid"><div><span className="kicker">{"// LABORATÓRIOS"}</span><h2>APRENDA<br /><em>ATACANDO.</em></h2><p>Ambientes isolados e intencionalmente vulneráveis. Teste hipóteses, explore falhas, documente evidências e desenvolva raciocínio técnico — sempre com autorização.</p><ul><li><b>01</b> Cenários inspirados no mundo real</li><li><b>02</b> Máquinas disponíveis sob demanda</li><li><b>03</b> Feedback e progresso por competência</li></ul></div><div className="network-card"><div className="radar"><span className="node kali">KALI<small>10.0.0.2</small></span><span className="node target">TARGET<small>10.0.0.8</small></span><span className="node root">ROOT<small>ACCESS</small></span><i className="line l1"/><i className="line l2"/></div><div className="flow"><span>SCAN</span><b>→</b><span>EXPLOIT</span><b>→</b><span>PRIVILEGE</span><b>→</b><span>FLAG</span></div></div></div></section>

      <section className="ctf shell" id="ctf">
        <div className="ctf-no">15K</div><div className="ctf-copy"><span className="kicker">{"// CAPTURE THE FLAG"}</span><h2>NÃO É UMA PROVA.<br /><em>É UMA BATALHA.</em></h2><p>Uma arena técnica para testar exploração, raciocínio e velocidade. Encontre vulnerabilidades, escale privilégios e conquiste as flags.</p><div className="prize"><small>PRÊMIO PRINCIPAL</small><strong>R$ 15.000</strong><span>EM PREMIAÇÃO*</span></div><a className="button primary" href="#inscricao">ENTRAR NA LISTA DO CTF ↗</a><small className="legal">*Premiação, elegibilidade, datas e critérios sujeitos ao regulamento oficial.</small></div>
      </section>

      <section className="cert section" id="certificacao"><div className="shell cert-grid"><div><span className="kicker">{"// VALIDE SUA COMPETÊNCIA"}</span><h2>PROVE QUE<br /><em>VOCÊ SABE.</em></h2><p>Uma certificação conquistada na prática: investigação, exploração controlada, evidências e relatório profissional.</p><div className="steps">{["FORMAÇÃO", "LABORATÓRIOS", "CTF", "EXAME PRÁTICO", "RELATÓRIO", "CERTIFICAÇÃO"].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,"0")}</b><span>{x}</span></div>)}</div></div><div className="badge"><div className="badge-inner"><span>F/</span><strong>CERTIFIED<br />PENTESTER</strong><small>FORTIFYSEC · PRACTICAL SECURITY</small></div></div></div></section>

      <section className="section shell faq"><span className="kicker">{"// PERGUNTAS FREQUENTES"}</span><h2>SEM <em>DÚVIDAS.</em></h2><div className="faq-list">{faqs.map(([q,a],i)=><button key={q} onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i}><span><b>{String(i+1).padStart(2,"0")}</b>{q}</span><i>{openFaq===i?"−":"+"}</i>{openFaq===i&&<p>{a}</p>}</button>)}</div></section>

      <section className="offer" id="oferta"><div className="shell offer-grid"><div className="offer-copy"><span className="kicker">{"// ACESSO COMPLETO"}</span><h2>INVISTA NA SUA<br /><em>PRÓXIMA VERSÃO.</em></h2><p>Uma única matrícula para acessar toda a formação FortifySec: 37 cursos, laboratórios, comunidade, CTF e preparação para certificação prática.</p><ul><li><span>✓</span> 633 horas de formação</li><li><span>✓</span> 37 cursos e atualizações</li><li><span>✓</span> Laboratórios controlados</li><li><span>✓</span> Acesso ao CTF FortifySec</li><li><span>✓</span> Certificado de conclusão</li></ul></div><div className="price-card"><div className="promo-ribbon">OFERTA DE LANÇAMENTO</div><div className="price-top"><span>PRIMEIRA TURMA</span><small>VAGAS PROMOCIONAIS</small></div><div className="price"><small>DE <del>R$ 5.000</del> POR</small><strong><sup>R$</sup> 2.997</strong><div className="saving">VOCÊ ECONOMIZA R$ 2.003</div><p>no Pix ou em até <b>12x no cartão</b>, conforme condições do emissor</p></div><div className="payment-methods"><div><i>PIX</i><span>Aprovação rápida</span></div><div><i>12×</i><span>Cartão de crédito</span></div></div><button className="button primary checkout-button" type="button" onClick={startCheckout} disabled={checkoutLoading}>{checkoutLoading ? "ABRINDO PAGAMENTO..." : "GARANTIR PREÇO PROMOCIONAL ↗"}</button>{checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}<small className="secure-note">▣ PAGAMENTO PROCESSADO EM AMBIENTE SEGURO</small></div></div></section>

      <section className="final" id="inscricao"><div className="shell"><span className="kicker">{"// SUA PRÓXIMA MISSÃO COMEÇA AQUI"}</span><h2>PRONTO PARA ENTRAR<br />NO <em>MUNDO REAL?</em></h2><p>Entre na lista prioritária e receba as condições da primeira turma, o calendário e o regulamento do CTF.</p><form onSubmit={(e)=>e.preventDefault()}><label><span>SEU MELHOR E-MAIL</span><input type="email" placeholder="voce@email.com" required /></label><button className="button primary" type="submit">GARANTIR MEU ACESSO ↗</button></form></div></section>

      <footer className="shell"><a className="brand" href="#top"><span className="brand-mark">F/</span> FORTIFYSEC</a><p>FORMAÇÃO PROFISSIONAL EM CYBERSECURITY<br />Pratique apenas em ambientes autorizados.</p><div><a href="#formacao">FORMAÇÃO</a><a href="#ctf">CTF</a><a href="#labs">LABS</a></div><small>© 2026 FORTIFYSEC. TODOS OS DIREITOS RESERVADOS.</small></footer>
    </main>
  );
}
