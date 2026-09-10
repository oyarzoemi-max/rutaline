import { useRouter } from 'next/router';
import { CATEGORIES } from '../lib/categories';

const MESSAGES = {
  ok: {
    title: '¡Listo! Tu lugar está reservado.',
    body: 'Confirmamos el pago y tu posición ya se está activando en el ranking. Puede tardar unos segundos en aparecer.',
  },
  cancelado: {
    title: 'El pago no se completó',
    body: 'No se realizó ningún cargo. Podés volver e intentar de nuevo cuando quieras.',
  },
  pendiente: {
    title: 'Tu pago está pendiente',
    body: 'Algunos medios de pago (como transferencias) tardan en confirmarse. Te va a aparecer en el ranking apenas se acredite.',
  },
};

function Logo() {
  return (
    <a className="logo" href="/">
      <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="32" r="3.2" fill="#C9A227" />
        <path d="M9 30.5 C 22 8, 38 8, 50 13" stroke="#C9A227" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" />
        <path d="M50 13 L44 10.5 M50 13 L46.5 18.5" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="logo-word">Rutaline</span>
    </a>
  );
}

export default function Gracias() {
  const router = useRouter();
  const status = router.query.status || 'ok';
  const category = router.query.category;
  const destino = router.query.destino;
  const msg = MESSAGES[status] || MESSAGES.ok;

  // Sugerimos hasta 3 categorías distintas a la que acaba de pagar,
  // en el MISMO destino — es el momento de más intención de compra.
  const suggestions = category
    ? CATEGORIES.filter((c) => c.id !== category).slice(0, 3)
    : [];

  return (
    <>
      <header>
        <div className="wrap"><Logo /></div>
      </header>

      <section className="hero" style={{ minHeight: status === 'ok' && category ? 'auto' : '60vh', display: 'flex', alignItems: 'center', paddingBottom: 56 }}>
        <div className="wrap">
          <h1 style={{ fontSize: 38 }}>{msg.title}</h1>
          <p className="sub">{msg.body}</p>
          <div className="hero-actions">
            <a href="/#ranking" className="btn">Ver el ranking</a>
            <a href="/" className="btn btn-outline">Volver al inicio</a>
          </div>
        </div>
      </section>

      {status === 'ok' && category && destino && suggestions.length > 0 && (
        <section className="section section--ivory">
          <div className="wrap">
            <div className="section-head">
              <h2>¿También ofrecés esto en {destino}?</h2>
              <p>
                Ya tenés un lugar reservado ahí. Sumar otra categoría en el mismo destino te
                pone delante de gente que busca cosas distintas, con el mismo nivel de intención
                de compra.
              </p>
            </div>
            <div className="pricing-grid">
              {suggestions.map((c) => (
                <div className="ticket" key={c.id}>
                  <div className="perf" />
                  <h3>{c.label}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 8, marginBottom: 18 }}>
                    Reclamá un lugar en {c.label.toLowerCase()} para {destino}, en un solo paso.
                  </p>
                  <a
                    className="btn"
                    style={{ width: '100%', textAlign: 'center', display: 'block' }}
                    href={`/?openClaim=1&category=${c.id}&destino=${encodeURIComponent(destino)}`}
                  >
                    Sumar esta categoría
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
