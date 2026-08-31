import Link from 'next/link'

type PublicCtaProps = {
  locale?: 'pt' | 'en'
}

export function PublicCta({ locale = 'pt' }: PublicCtaProps) {
  const isEnglish = locale === 'en'

  return (
    <section className="section">
      <div className="container">
        <div className="cta-panel">
          <div>
            <div className="kicker">RECOVERY READY</div>
            <h2>
              {isEnglish
                ? 'Backup is only useful when recovery works.'
                : 'Backup só é útil quando a recuperação funciona.'}
            </h2>
            <p>
              {isEnglish
                ? 'We map your environment, deploy the protection policy and periodically test restoration.'
                : 'Mapeamos seu ambiente, implantamos a política de proteção e testamos a restauração periodicamente.'}
            </p>
          </div>

          <div className="cta-actions">
            <Link className="btn" href={isEnglish ? '/en/contact' : '/contato'}>
              {isEnglish ? 'REQUEST ASSESSMENT →' : 'SOLICITAR DIAGNÓSTICO →'}
            </Link>
            <Link className="btn secondary" href={isEnglish ? '/en/plans' : '/planos'}>
              {isEnglish ? 'VIEW PLANS' : 'VER PLANOS'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
