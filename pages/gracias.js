import { useRouter } from 'next/router';

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

export default function Gracias() {
  const router = useRouter();
  const status = router.query.status || 'ok';
  const msg = MESSAGES[status] || MESSAGES.ok;

  return (
    <>
      <header>
        <div className="wrap">
          <a className="logo" href="/">
            <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="32" r="3.2" fill="#C9A227" />
              <path d="M9 30.5 C 22 8, 38 8, 50 13" stroke="#C9A227" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" />
              <path d="M50 13 L44 10.5 M50 13 L46.5 18.5" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="logo-word">Rutaline</span>
          </a>
        </div>
      </header>

      <section className="hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap">
          <h1 style={{ fontSize: 38 }}>{msg.title}</h1>
          <p className="sub">{msg.body}</p>
          <div className="hero-actions">
            <a href="/#ranking" className="btn">Ver el ranking</a>
            <a href="/" className="btn btn-outline">Volver al inicio</a>
          </div>
        </div>
      </section>
    </>
  );
}
