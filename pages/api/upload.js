// pages/api/upload.js
// POST: Upload billede til et opstillingsblad
// DELETE: Slet et billede

import formidable from 'formidable';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../lib/session';
import { addImage, deleteImage } from '../../lib/db';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: { bodyParser: false },
};

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.user) return res.status(401).json({ error: 'Ikke logget ind.' });

  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20 MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Fejl ved upload: ' + err.message });

      const file = Array.isArray(files.image) ? files.image[0] : files.image;
      const sheetId = Array.isArray(fields.sheet_id) ? fields.sheet_id[0] : fields.sheet_id;
      const caption = Array.isArray(fields.caption) ? fields.caption[0] : (fields.caption || '');

      if (!file || !sheetId) {
        return res.status(400).json({ error: 'Billede og opstillings-ID er påkrævet.' });
      }

      // Giv filen et unikt navn
      const ext = path.extname(file.originalFilename || file.newFilename || '.jpg');
      const uniqueName = `${uuidv4()}${ext}`;
      const newPath = path.join(uploadsDir, uniqueName);
      fs.renameSync(file.filepath, newPath);

      const imageId = addImage(sheetId, uniqueName, file.originalFilename, session.user.display_name, caption);

      return res.status(201).json({
        id: imageId,
        filename: uniqueName,
        url: `/uploads/${uniqueName}`,
      });
    });

    return; // form.parse er async, svar sendes inde i callback
  }

  if (req.method === 'DELETE') {
    // Body er JSON her (bodyParser er slået fra globalt, men vi parser manuelt)
    let body = '';
    for await (const chunk of req) body += chunk;
    const { image_id } = JSON.parse(body);

    const img = deleteImage(image_id);
    if (img) {
      const filePath = path.join(uploadsDir, img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
