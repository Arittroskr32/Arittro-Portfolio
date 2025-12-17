import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM skills';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, proficiency DESC';

    const [skills] = await pool.query<RowDataPacket[]>(query, params);

    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSkillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [skills] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM skills WHERE id = ?',
      [id]
    );

    if (skills.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(skills[0]);
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name, category, proficiency, icon } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO skills (name, category, proficiency, icon)
       VALUES (?, ?, ?, ?)`,
      [name, category, proficiency, icon]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Skill created successfully'
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, proficiency, icon } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE skills SET 
        name = ?, category = ?, proficiency = ?, icon = ?
       WHERE id = ?`,
      [name, category, proficiency, icon, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM skills WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
