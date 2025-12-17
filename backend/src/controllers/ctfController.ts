import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { deleteImage } from '../middleware/upload.js';

export const getAllCTFEntries = async (req: Request, res: Response) => {
  try {
    const [entries] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ctf_entries ORDER BY event_date DESC, competition_name'
    );

    res.json(entries);
  } catch (error) {
    console.error('Get CTF entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCTFEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [entries] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ctf_entries WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ error: 'CTF entry not found' });
    }

    res.json(entries[0]);
  } catch (error) {
    console.error('Get CTF entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createCTFEntry = async (req: Request, res: Response) => {
  try {
    const { 
      competition_name, 
      event_date, 
      rank, 
      team_name, 
      challenges_solved, 
      total_challenges, 
      points_earned, 
      writeup_url, 
      description 
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ctf_entries (' +
        'competition_name, event_date, `rank`, team_name, ' +
        'challenges_solved, total_challenges, points_earned, ' +
        'writeup_url, description, image_url' +
      ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        competition_name, 
        event_date, 
        rank, 
        team_name, 
        challenges_solved, 
        total_challenges, 
        points_earned, 
        writeup_url, 
        description, 
        image_url
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'CTF entry created successfully'
    });
  } catch (error) {
    console.error('Create CTF entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCTFEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      competition_name, 
      event_date, 
      rank, 
      team_name, 
      challenges_solved, 
      total_challenges, 
      points_earned, 
      writeup_url, 
      description 
    } = req.body;

    // Get existing entry to check for old image
    const [existingEntries] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM ctf_entries WHERE id = ?',
      [id]
    );

    if (existingEntries.length === 0) {
      return res.status(404).json({ error: 'CTF entry not found' });
    }

    const oldImageUrl = existingEntries[0].image_url;
    let image_url = oldImageUrl;

    // If new image uploaded, delete old one and update
    if (req.file) {
      if (oldImageUrl) {
        deleteImage(oldImageUrl);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE ctf_entries SET ' +
        'competition_name = ?, event_date = ?, `rank` = ?, team_name = ?, ' +
        'challenges_solved = ?, total_challenges = ?, points_earned = ?, ' +
        'writeup_url = ?, description = ?, image_url = ? ' +
       'WHERE id = ?',
      [
        competition_name, 
        event_date, 
        rank, 
        team_name, 
        challenges_solved, 
        total_challenges, 
        points_earned, 
        writeup_url, 
        description, 
        image_url,
        id
      ]
    );

    res.json({ message: 'CTF entry updated successfully' });
  } catch (error) {
    console.error('Update CTF entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCTFEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get entry to delete associated image
    const [entries] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM ctf_entries WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ error: 'CTF entry not found' });
    }

    // Delete image if exists
    if (entries[0].image_url) {
      deleteImage(entries[0].image_url);
    }

    // Delete entry
    await pool.query<ResultSetHeader>(
      'DELETE FROM ctf_entries WHERE id = ?',
      [id]
    );

    res.json({ message: 'CTF entry deleted successfully' });
  } catch (error) {
    console.error('Delete CTF entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCtfImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get entry to find image
    const [entries] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM ctf_entries WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ error: 'CTF entry not found' });
    }

    const imageUrl = entries[0].image_url;

    if (!imageUrl) {
      return res.status(400).json({ error: 'No image to delete' });
    }

    // Delete image file
    deleteImage(imageUrl);

    // Update database to remove image_url
    await pool.query<ResultSetHeader>(
      'UPDATE ctf_entries SET image_url = NULL WHERE id = ?',
      [id]
    );

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete CTF image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
