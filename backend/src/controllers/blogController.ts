import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

const makeFullUrl = (p: any) => {
  if (!p) return null;
  const str = String(p);
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  return `${BACKEND_URL}${str}`;
};

// Get all blog posts
export const getAllBlogPosts = async (req: Request, res: Response) => {
  try {
    const [blogs] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM blog_posts ORDER BY created_at DESC'
    );
    // Prefix image paths with BACKEND_URL for frontend consumption
    const transformed = blogs.map(b => ({
      ...b,
      image_url: makeFullUrl(b.image_url)
    }));
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get single blog post by ID
export const getBlogPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [blogs] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blog = blogs[0];
    blog.image_url = makeFullUrl(blog.image_url);
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Create new blog post
export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const { title, category, tags, content } = req.body;
    const image = req.file;

    let imageUrl = null;
    if (image) {
      imageUrl = `/uploads/${image.filename}`;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO blog_posts (title, category, tags, content, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, category || '', tags || '', content, imageUrl]
    );

    res.status(201).json({
      message: 'Blog created successfully',
      id: result.insertId,
      image_url: makeFullUrl(imageUrl)
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

// Update blog post
export const updateBlogPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, tags, content, deleteImage } = req.body;
    const image = req.file;

    // Get existing blog to check for old image
    const [existingBlogs] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM blog_posts WHERE id = ?',
      [id]
    );

    if (existingBlogs.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    let imageUrl = existingBlogs[0].image_url;

    // If user wants to delete the image
    if (deleteImage === 'true' && !image) {
      if (imageUrl) {
        const oldImagePath = path.join(__dirname, '../../..', imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = null;
    }
    // If new image is uploaded, delete old one and update
    else if (image) {
      if (imageUrl) {
        const oldImagePath = path.join(__dirname, '../../..', imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/${image.filename}`;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE blog_posts 
       SET title = ?, category = ?, tags = ?, content = ?, image_url = ?
       WHERE id = ?`,
      [title, category || '', tags || '', content, imageUrl, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog updated successfully', image_url: makeFullUrl(imageUrl) });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

// Delete blog post
export const deleteBlogPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get blog to delete associated image
    const [blogs] = await pool.query<RowDataPacket[]>(
      'SELECT image_url FROM blog_posts WHERE id = ?',
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const imageUrl = blogs[0].image_url;

    // Delete blog from database
    await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);

    // Delete image file if exists
    if (imageUrl) {
      const imagePath = path.join(__dirname, '../../..', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
