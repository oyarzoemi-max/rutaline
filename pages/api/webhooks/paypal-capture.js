import { capturePaypalOrder } from '../../lib/paypal';
import { confirmPendingBid } from '../../lib/confirmBid';

export default async function handler(req, res) {
  const { token, pending_bid_id, category, destino } = req.query;
  const siteUrl = process.env.SITE_URL;

  if (!token || !pending_bid_id) {
    return res.redirect(302, `${siteUrl}/gracias?status=cancelado`);
  }

  try {
    // "token" acá es el ID de la orden de PayPal, no una credencial secreta.
    const { captured } = await capturePaypalOrder(token);

    if (captured) {
      await confirmPendingBid(pending_bid_id);
      const qs = new URLSearchParams({
        status: 'ok',
        category: category || '',
        destino: destino || '',
      });
      return res.redirect(302, `${siteUrl}/gracias?${qs.toString()}`);
    }

    return res.redirect(302, `${siteUrl}/gracias?status=cancelado`);
  } catch (err) {
    console.error('Error capturando el pago de PayPal:', err);
    return res.redirect(302, `${siteUrl}/gracias?status=cancelado`);
  }
}
