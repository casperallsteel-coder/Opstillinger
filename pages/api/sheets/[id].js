// pages/api/sheets/[id].js
// GET: Hent ét opstillingsblad med billeder
// PUT: Opdater opstillingsblad
// DELETE: Slet opstillingsblad (kun admin)

import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';
import { getSheetById, updateSheet, deleteSheet, getImagesBySheetId } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.user) return res.status(401).json({ error: 'Ikke logget ind.' });

  const { id } = req.query;
  const sheet = getSheetById(id);
  if (!sheet) return res.status(404).json({ error: 'Opstillingsblad ikke fundet.' });

  if (req.method === 'GET') {
    const images = getImagesBySheetId(id);
    return res.status(200).json({
      ...sheet,
      extra_data: JSON.parse(sheet.extra_data || '{}'),
      images,
    });
  }

  if (req.method === 'PUT') {
    const { varenummer, beskrivelse, maskine_type, programnummer, extra_data, noter } = req.body;

    if (!varenummer || !maskine_type) {
      return res.status(400).json({ error: 'Varenummer og maskine er påkrævet.' });
    }

    updateSheet(id, {
      varenummer: varenummer.trim().toUpperCase(),
      beskrivelse,
      maskine_type,
      programnummer,
      extra_data,
      noter,
      updated_by: session.user.display_name,
    });

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    if (session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Kun administratorer kan slette opstillingsblade.' });
    }
    deleteSheet(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
