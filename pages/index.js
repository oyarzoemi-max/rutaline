import { useEffect, useState } from 'react';

const CATEGORIES = [
  { id: 'hoteles', label: 'Hoteles' },
  { id: 'cruceros', label: 'Cruceros' },
  { id: 'agencias', label: 'Agencias de viaje' },
  { id: 'tours', label: 'Tours y excursiones' },
];

const DESTINATIONS = [
  { id: 'cancun', label: 'Cancún, México' },
  { id: 'bali', label: 'Bali, Indonesia' },
  { id: 'roma', label: 'Roma, Italia' },
  { id: 'santorini', label: 'Santorini, Grecia' },
];

function Logo() {
  return (
    <a className="logo" href="#">
      <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="32" r="3.2" fill="#C9A227" />
        <path d="M9 30.5 C 22 8, 38 8, 50 13" stroke="#C9A227" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" />
        <path d="M50 13 L44 10.5 M50 13 L46.5 18.5" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="logo-word">Rutaline</span>
    </a>
  );
}

// Formatea centavos guardados en la base como precio legible
function formatBid(cents) {
  return cents > 0 ? `$${(cents / 100).toFixed(0)}` : 'Gratis';
}
function nextBidLabel(cents) {
  return cents > 0 ? cents / 100 + 5 : 10;
}

export default function Home() {
  const [category, setCategory] = useState('hoteles');
  const [destino, setDestino] = useState('cancun');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/listings?category=${category}&destino=${destino}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setListings(data.listings || []);
      })
      .catch(() => { if (!cancelled) setListings([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, destino]);

  const topBidCents = listings.length ? listings[0].bid_cents : 0;

  function openClaimForm() {
    setPrefill({ category, destino, minBid: nextBidLabel(topBidCents) });
    setFormOpen(true);
  }

  return (
    <>
      <header>
        <div className="wrap">
          <Logo />
          <nav>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#ranking">Ver ranking</a>
            <a href="#precios">Precios</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <p className="route-line"><span className="dot" />RUTA GLOBAL · edición turismo mundial</p>
          <h1>Tu hotel, agencia o tour, en la puerta de embarque que ve todo el mundo.</h1>
          <p className="sub">
            Rutaline es un ranking público por destino y categoría. Aparecés gratis, subís
            pagando, y cada posición es una página que Google indexa y la gente busca todos los días.
          </p>
          <div className="hero-actions">
            <button className="btn" onClick={openClaimForm}>Reclamar mi lugar desde $10</button>
            <a href="#ranking" className="btn btn-outline">Ver el ranking en vivo</a>
          </div>
          <p className="hero-note">Sin casino, sin apuestas. Es publicidad transparente: pagás por posición, no por suerte.</p>
        </div>
      </section>

      <section className="section section--ivory" id="como-funciona">
        <div className="wrap">
          <div className="section-head">
            <h2>Tres pasos, sin vueltas</h2>
            <p>Nada de puntajes secretos ni algoritmos de "relevancia". La posición es la oferta, y punto.</p>
          </div>
          <div className="steps">
            <div className="step">
              <p className="num mono">01</p>
              <h3>Elegís destino y categoría</h3>
              <p>Hoteles, cruceros, agencias, tours — en el destino donde ya tenés clientes buscando.</p>
            </div>
            <div className="step">
              <p className="num mono">02</p>
              <h3>Hacés tu oferta</h3>
              <p>Arrancás desde $10. Tomar el primer puesto cuesta al menos $5 más que la oferta actual.</p>
            </div>
            <div className="step">
              <p className="num mono">03</p>
              <h3>Recibís clics reales</h3>
              <p>Tu página queda indexada en buscadores, así que el tráfico sigue llegando entre renovaciones.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--deep" id="ranking">
        <div className="wrap">
          <div className="section-head">
            <h2>Ranking en vivo</h2>
            <p>Elegí una categoría y un destino para ver quién está arriba ahora mismo.</p>
          </div>
          <div className="panel">
            <div className="tabs">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`tab ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="dest-row">
              <label>Destino</label>
              <select value={destino} onChange={(e) => setDestino(e.target.value)}>
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            {loading && <div className="empty-state">Cargando ranking…</div>}

            {!loading && listings.length === 0 && (
              <div className="empty-state">
                Todavía nadie reclamó un lugar acá. Podés ser el primero — y quedar como Fundador.
              </div>
            )}

            {!loading && listings.map((item, i) => (
              <div className="listing" key={item.id}>
                <div className="pos">{i + 1}</div>
                <div>
                  <div className="name">
                    {item.name}
                    {item.founder && <span className="founder-tag">FUNDADOR</span>}
                  </div>
                  <div className="blurb">{item.blurb}</div>
                </div>
                <div className="clicks">{item.clicks.toLocaleString('es')} clics</div>
                <div className="claim">
                  <div className="amt">{formatBid(item.bid_cents)}</div>
                  <button className="btn btn-outline" style={{ color: '#0B1F35', borderColor: '#0B1F35', marginTop: 6, fontSize: 12, padding: '7px 12px' }} onClick={openClaimForm}>
                    Superar por ${nextBidLabel(item.bid_cents)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--navy" id="destacados">
        <div className="wrap">
          <div className="section-head">
            <h2>Destacados del mes</h2>
            <p>El #1 de cada categoría al cierre del mes lo publicamos en nuestras redes como recomendado — exposición extra, sin costo adicional.</p>
          </div>
          <div className="spotlight-banner">
            📅 Se cierra el 30 de cada mes · <strong>seguí el ranking en vivo arriba para ver quién lidera hoy</strong>
          </div>
        </div>
      </section>

      <section className="section section--ivory" id="precios">
        <div className="wrap">
          <div className="section-head">
            <h2>Cómo se paga</h2>
            <p>Listado base gratis para todos. Estas son las formas de subir posiciones.</p>
          </div>
          <div className="pricing-grid">
            <div className="ticket">
              <div className="perf" />
              <h3>Listado base</h3>
              <div className="price">Gratis</div>
              <ul>
                <li>Aparecés en tu categoría y destino</li>
                <li>Página indexada en buscadores</li>
                <li>Posición según orden de ingreso</li>
              </ul>
            </div>
            <div className="ticket">
              <div className="perf" />
              <h3>Oferta por posición</h3>
              <div className="price">Desde $10</div>
              <ul>
                <li>Subís al instante al pagar</li>
                <li>Solo pagás la diferencia si volvés a ofertar</li>
                <li>Renovación cada 30 días</li>
              </ul>
            </div>
            <div className="ticket">
              <div className="perf" />
              <h3>Verificado</h3>
              <div className="price">+$15/mes</div>
              <ul>
                <li>Insignia de negocio verificado</li>
                <li>Ficha con fotos y contacto directo</li>
                <li>Prioridad en empate de ofertas</li>
              </ul>
            </div>
          </div>
          <div className="spotlight-banner" style={{ marginTop: 24, background: '#0B1F35', borderLeftColor: '#C9A227' }}>
            🎟️ Los primeros 10 negocios en cada destino y categoría reciben la insignia <strong>Fundador</strong> de por vida.
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <Logo />
          <p>Prototipo funcional · datos reales una vez conectada la base de datos.</p>
        </div>
      </footer>

      {formOpen && (
        <ClaimModal
          initial={prefill}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}

function ClaimModal({ initial, onClose }) {
  const [form, setForm] = useState({
    category: initial.category,
    destino: initial.destino,
    name: '',
    url: '',
    blurb: '',
    bidAmountUsd: initial.minBid,
    provider: 'stripe',
  });
  const [minBid, setMinBid] = useState(initial.minBid);
  const [checkingMin, setCheckingMin] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Cada vez que cambia la categoría o el destino elegidos DENTRO del formulario,
  // recalculamos cuál es la oferta mínima real para esa combinación.
  useEffect(() => {
    let cancelled = false;
    setCheckingMin(true);
    fetch(`/api/listings?category=${form.category}&destino=${form.destino}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const top = (data.listings && data.listings[0]) ? data.listings[0].bid_cents : 0;
        const nb = top > 0 ? top / 100 + 5 : 10;
        setMinBid(nb);
        // Si la oferta que el usuario había tipeado ya no alcanza para la nueva
        // combinación, la actualizamos; si sigue siendo válida, la dejamos como está.
        setForm((f) => (Number(f.bidAmountUsd) < nb ? { ...f, bidAmountUsd: nb } : f));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCheckingMin(false); });
    return () => { cancelled = true; };
  }, [form.category, form.destino]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Algo salió mal, intentá de nuevo.');
        setSubmitting(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError('No se pudo conectar con el servidor de pagos.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(11,31,53,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50,
    }}>
      <form className="bid-form" onSubmit={submit}>
        <h3>Reclamá tu lugar</h3>
        <p className="hint">
          Elegí la categoría y el destino exactos para tu negocio — la oferta mínima se
          recalcula sola según dónde quieras aparecer.
        </p>

        {error && <div className="form-error">{error}</div>}

        <div className="field" style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Categoría</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Destino</label>
            <select value={form.destino} onChange={(e) => update('destino', e.target.value)}>
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="form-note" style={{ marginTop: -8, marginBottom: 16 }}>
          {checkingMin ? 'Calculando oferta mínima…' : `Oferta mínima para esta combinación: $${minBid}`}
        </p>

        <div className="field">
          <label>Nombre del negocio</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Sitio web o link de reservas</label>
          <input required type="url" placeholder="https://" value={form.url} onChange={(e) => update('url', e.target.value)} />
        </div>
        <div className="field">
          <label>Descripción corta (una línea)</label>
          <textarea rows={2} value={form.blurb} onChange={(e) => update('blurb', e.target.value)} />
        </div>
        <div className="field">
          <label>Tu oferta en USD</label>
          <input
            required type="number" min={minBid} step="1"
            value={form.bidAmountUsd}
            onChange={(e) => update('bidAmountUsd', e.target.value)}
          />
        </div>

        <div className="provider-choice">
          <label>
            <input type="radio" name="provider" checked={form.provider === 'stripe'} onChange={() => update('provider', 'stripe')} />
            Tarjeta (Stripe)
          </label>
          <label>
            <input type="radio" name="provider" checked={form.provider === 'mercadopago'} onChange={() => update('provider', 'mercadopago')} />
            Mercado Pago
          </label>
        </div>

        <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Redirigiendo al pago…' : 'Ir a pagar y reclamar el lugar'}
        </button>
        <button type="button" onClick={onClose} className="form-note" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '12px auto 0' }}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
