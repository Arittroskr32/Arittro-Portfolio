import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const submitContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO contact_messages (name, email, message)
       VALUES (?, ?, ?)`,
      [name, email, message]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllContactMessages = async (req: Request, res: Response) => {
  try {
    const { unreadOnly } = req.query;
    
    let query = 'SELECT * FROM contact_messages';
    
    if (unreadOnly === 'true') {
      query += ' WHERE read_status = FALSE';
    }

    query += ' ORDER BY created_at DESC';

    const [messages] = await pool.query<RowDataPacket[]>(query);

    res.json(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE contact_messages SET read_status = TRUE WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM contact_messages WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
