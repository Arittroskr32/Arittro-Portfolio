import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllBugBountyEntries = async (req: Request, res: Response) => {
  try {
    const { status, severity } = req.query;
    
    let query = 'SELECT * FROM bug_bounty_entries';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (severity) {
      conditions.push('severity = ?');
      params.push(severity);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY report_date DESC';

    const [entries] = await pool.query<RowDataPacket[]>(query, params);

    // Convert bounty_amount from string to number
    const formattedEntries = entries.map(entry => ({
      ...entry,
      bounty_amount: entry.bounty_amount ? parseFloat(entry.bounty_amount) : null
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Get bug bounty entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBugBountyEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [entries] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bug_bounty_entries WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Bug bounty entry not found' });
    }

    // Convert bounty_amount from string to number
    const entry = {
      ...entries[0],
      bounty_amount: entries[0].bounty_amount ? parseFloat(entries[0].bounty_amount) : null
    };

    res.json(entry);
  } catch (error) {
    console.error('Get bug bounty entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createBugBountyEntry = async (req: Request, res: Response) => {
  try {
    const { program_name, vulnerability_type, severity, bounty_amount, report_date, status, description, report_url } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO bug_bounty_entries (program_name, vulnerability_type, severity, bounty_amount, report_date, status, description, report_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [program_name, vulnerability_type, severity, bounty_amount || null, report_date, status || 'Pending', description || '', report_url || '']
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Bug bounty entry created successfully'
    });
  } catch (error) {
    console.error('Create bug bounty entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBugBountyEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { program_name, vulnerability_type, severity, bounty_amount, report_date, status, description, report_url } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE bug_bounty_entries SET 
        program_name = ?, vulnerability_type = ?, severity = ?, bounty_amount = ?, 
        report_date = ?, status = ?, description = ?, report_url = ?
       WHERE id = ?`,
      [program_name, vulnerability_type, severity, bounty_amount || null, report_date, status || 'Pending', description || '', report_url || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bug bounty entry not found' });
    }

    res.json({ message: 'Bug bounty entry updated successfully' });
  } catch (error) {
    console.error('Update bug bounty entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteBugBountyEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM bug_bounty_entries WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bug bounty entry not found' });
    }

    res.json({ message: 'Bug bounty entry deleted successfully' });
  } catch (error) {
    console.error('Delete bug bounty entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
