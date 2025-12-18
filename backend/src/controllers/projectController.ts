
import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { deleteImage } from '../middleware/upload.js';
const BACKEND_URL = process.env.BACKEND_URL || (process.env.VITE_API_URL ? String(process.env.VITE_API_URL).replace(/\/api\/?$/i, '') : 'http://localhost:8888');

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { featured } = req.query;
    
    let query = 'SELECT * FROM projects';
    const params: any[] = [];

    if (featured === 'true') {
      query += ' WHERE featured = TRUE';
    }

    query += ' ORDER BY created_at DESC';

    const [projects] = await pool.query<RowDataPacket[]>(query, params);

    // Return projects as-is (technologies is stored as comma-separated string)
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [projects] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Return project as-is (technologies is stored as comma-separated string)
    res.json(projects[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, long_description, category, technologies, github_url, live_url, featured, authors } = req.body;
    
    let image_url = req.file ? `/uploads/${req.file.filename}` : null;
    // normalize stored path to avoid full URL being saved
    try {
      if (image_url && (image_url.startsWith('http://') || image_url.startsWith('https://'))) {
        const u = new URL(image_url);
        image_url = u.pathname + (u.search || '');
      }
    } catch (e) {}
    let full_image_url = image_url ? `${BACKEND_URL}${image_url}` : null;
    const featuredValue = featured === 'true' || featured === true ? 1 : 0;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO projects (title, description, long_description, category, technologies, github_url, live_url, featured, image_url, authors)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, long_description, category, technologies, github_url, live_url, featuredValue, image_url, authors || null]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Project created successfully',
      image_url: full_image_url
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, long_description, category, technologies, github_url, live_url, featured, authors } = req.body;

    // Get existing project to check for old image
    const [existingProjects] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM projects WHERE id = ?',
      [id]
    );

    if (existingProjects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const oldImageUrl = existingProjects[0].image_url;
    let image_url = oldImageUrl && (oldImageUrl.startsWith('http://') || oldImageUrl.startsWith('https://')) ? (new URL(oldImageUrl)).pathname : oldImageUrl;
    let full_image_url = image_url ? `${BACKEND_URL}${image_url}` : null;

    // If new image uploaded, delete old one and update
    if (req.file) {
      if (oldImageUrl) {
        deleteImage(oldImageUrl);
      }
      image_url = `/uploads/${req.file.filename}`;
      full_image_url = `${BACKEND_URL}${image_url}`;
    }

    const featuredValue = featured === 'true' || featured === true ? 1 : 0;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE projects SET 
        title = ?, description = ?, long_description = ?, category = ?, technologies = ?, 
        github_url = ?, live_url = ?, featured = ?, image_url = ?, authors = ?
       WHERE id = ?`,
      [title, description, long_description, category, technologies, github_url, live_url, featuredValue, image_url, authors || null, id]
    );

    res.json({ message: 'Project updated successfully', image_url: full_image_url });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get project to delete associated image
    const [projects] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM projects WHERE id = ?',
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete image if exists
    if (projects[0].image_url) {
      deleteImage(projects[0].image_url);
    }

    // Delete project
    await pool.query<ResultSetHeader>(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProjectImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get project to find image
    const [projects] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM projects WHERE id = ?',
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const imageUrl = projects[0].image_url;

    if (!imageUrl) {
      return res.status(400).json({ error: 'No image to delete' });
    }

    // Delete image file
    deleteImage(imageUrl);

    // Update database to remove image_url
    await pool.query<ResultSetHeader>(
      'UPDATE projects SET image_url = NULL WHERE id = ?',
      [id]
    );

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete project image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
