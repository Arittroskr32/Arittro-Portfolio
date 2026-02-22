import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { deleteImage } from '../middleware/upload.js';

export const getAllCertificates = async (_req: Request, res: Response) => {
  try {
    const [certificates] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM certificates ORDER BY `rank` ASC, issue_date DESC, title ASC'
    );

    res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [certificates] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE id = ?',
      [id]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificates[0]);
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const normalizeTags = (value: any): string | null => {
  if (value == null) return null;
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean).join(',');
  }
  return String(value);
};

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const {
      rank,
      title,
      description,
      issuing_organization,
      issue_date,
      skill_tags,
      verification_link,
    } = req.body;

    let image_url = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      if (image_url && (image_url.startsWith('http://') || image_url.startsWith('https://'))) {
        const u = new URL(image_url);
        image_url = u.pathname + (u.search || '');
      }
    } catch (e) {}

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO certificates (
        \`rank\`, title, description, image_url,
        issuing_organization, issue_date, skill_tags, verification_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rank ?? 0,
        title,
        description,
        image_url,
        issuing_organization,
        issue_date,
        normalizeTags(skill_tags),
        verification_link || null,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Certificate created successfully',
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      rank,
      title,
      description,
      issuing_organization,
      issue_date,
      skill_tags,
      verification_link,
    } = req.body;

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM certificates WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const oldImageUrl = existing[0].image_url as string | null;
    let image_url = oldImageUrl;

    if (req.file) {
      if (oldImageUrl) {
        deleteImage(oldImageUrl);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE certificates SET
        \`rank\` = ?,
        title = ?,
        description = ?,
        image_url = ?,
        issuing_organization = ?,
        issue_date = ?,
        skill_tags = ?,
        verification_link = ?
      WHERE id = ?`,
      [
        rank ?? 0,
        title,
        description,
        image_url,
        issuing_organization,
        issue_date,
        normalizeTags(skill_tags),
        verification_link || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ message: 'Certificate updated successfully' });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [certificates] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM certificates WHERE id = ?',
      [id]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (certificates[0].image_url) {
      deleteImage(certificates[0].image_url);
    }

    await pool.query<ResultSetHeader>('DELETE FROM certificates WHERE id = ?', [id]);

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCertificateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [certificates] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM certificates WHERE id = ?',
      [id]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const imageUrl = certificates[0].image_url as string | null;
    if (!imageUrl) {
      return res.status(400).json({ error: 'No image to delete' });
    }

    deleteImage(imageUrl);
    await pool.query<ResultSetHeader>('UPDATE certificates SET image_url = NULL WHERE id = ?', [id]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete certificate image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
