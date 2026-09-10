import { MercadoPagoConfig, Payment } from 'mercadopago';
import { confirmPendingBid } from './stripe'; // reutilizamos la misma función de confirmación

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { type, data } = req.body;

    // Mercado Pago avisa por distintos tipos de evento; solo nos interesan los pagos
    if (type === 'payment' && data?.id) {
      const payment = new Payment(mpClient);
      const info = await payment.get({ id: data.id });

      if (info.status === 'approved') {
        const pendingBidId = info.metadata?.pending_bid_id;
        if (pendingBidId) {
          await confirmPendingBid(pendingBidId);
        }
      }
    }

    // Mercado Pago solo necesita un 200 para dejar de reintentar
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error en webhook de Mercado Pago:', err);
    res.status(500).json({ error: 'internal error' });
  }
}
