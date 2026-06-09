// pages/api/sheets/index.js
// GET: Hent alle opstillingsblade (med søgning)
// POST: Opret nyt opstillingsblad

import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';
import { getAllSheets, createSheet } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.user) return res.status(401).json({ error: 'Ikke logget ind.' });

  if (req.method === 'GET') {
    const { search } = req.query;
    const sheets = getAllSheets(search || '');
    // Parse extra_data JSON for hvert sheet
    const parsed = sheets.map(s => ({ ...s, extra_data: JSON.parse(s.extra_data || '{}') }));
    return res.status(200).json(parsed);
  }

  if (req.method === 'POST') {
    const { varenummer, beskrivelse, maskine_type, programnummer, extra_data, noter } = req.body;

    if (!varenummer || !maskine_type) {
      return res.status(400).json({ error: 'Varenummer og maskine er påkrævet.' });
    }

    const id = createSheet({
      varenummer: varenummer.trim().toUpperCase(),
      beskrivelse,
      maskine_type,
      programnummer,
      extra_data,
      noter,
      created_by: session.user.display_name,
    });

    return res.status(201).json({ id });
  }

  return res.status(405).end();
}
