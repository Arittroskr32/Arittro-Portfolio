import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllHighlights = async (req: Request, res: Response) => {
  try {
    const [highlights] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM highlights ORDER BY display_order'
    );

    res.json(highlights);
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateHighlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, value, icon, displayOrder } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE highlights SET 
        label = ?, value = ?, icon = ?, display_order = ?
       WHERE id = ?`,
      [label, value, icon, displayOrder, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Highlight not found' });
    }

    res.json({ message: 'Highlight updated successfully' });
  } catch (error) {
    console.error('Update highlight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfileContent = async (req: Request, res: Response) => {
  try {
    const [content] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM profile_content'
    );

    // Convert array to object for easier access
    const contentObj: Record<string, string> = {};
    content.forEach((item: any) => {
      contentObj[item.section] = item.content;
    });

    res.json(contentObj);
  } catch (error) {
    console.error('Get profile content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfileContent = async (req: Request, res: Response) => {
  try {
    const { section, content } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO profile_content (section, content) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE content = ?`,
      [section, content, content]
    );

    res.json({ message: 'Profile content updated successfully' });
  } catch (error) {
    console.error('Update profile content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [projectsCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM projects'
    );
    
    const [blogPostsCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM blog_posts'
    );
    
    const [ctfEntriesCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM ctf_entries'
    );
    
    const [bugBountyCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM bug_bounty_entries'
    );

    const [skillsCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM skills'
    );

    const [certificatesCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM certificates'
    );

    const [messagesCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM contact_messages WHERE read_status = FALSE'
    );

    res.json({
      projects: projectsCount[0].count,
      blogPosts: blogPostsCount[0].count,
      ctfEntries: ctfEntriesCount[0].count,
      bugBountyEntries: bugBountyCount[0].count,
      skills: skillsCount[0].count,
      certificates: certificatesCount[0].count,
      unreadMessages: messagesCount[0].count
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Journey Highlights Controllers
export const getAllJourneyHighlights = async (req: Request, res: Response) => {
  try {
    const [highlights] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM journey_highlights ORDER BY display_order ASC'
    );

    res.json(highlights);
  } catch (error) {
    console.error('Get journey highlights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createJourneyHighlight = async (req: Request, res: Response) => {
  try {
    const { year, title, description, is_featured } = req.body;

    // Get the max display_order to add at the end
    const [maxOrder] = await pool.query<RowDataPacket[]>(
      'SELECT MAX(display_order) as maxOrder FROM journey_highlights'
    );
    const nextOrder = (maxOrder[0].maxOrder || 0) + 1;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO journey_highlights (year, title, description, display_order, is_featured)
       VALUES (?, ?, ?, ?, ?)`,
      [year, title, description, nextOrder, is_featured || 0]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Journey highlight created successfully'
    });
  } catch (error) {
    console.error('Create journey highlight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateJourneyHighlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { year, title, description, display_order, is_featured } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE journey_highlights SET 
        year = ?, title = ?, description = ?, display_order = ?, is_featured = ?
       WHERE id = ?`,
      [year, title, description, display_order, is_featured, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Journey highlight not found' });
    }

    res.json({ message: 'Journey highlight updated successfully' });
  } catch (error) {
    console.error('Update journey highlight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteJourneyHighlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM journey_highlights WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Journey highlight not found' });
    }

    res.json({ message: 'Journey highlight deleted successfully' });
  } catch (error) {
    console.error('Delete journey highlight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Quick Stats Controllers
export const getStats = async (req: Request, res: Response) => {
  try {
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT section, content FROM profile_content 
       WHERE section LIKE 'stats_%'`
    );

    // Convert array to object
    const statsObj: Record<string, string> = {};
    stats.forEach((item: any) => {
      const key = item.section.replace('stats_', '');
      statsObj[key] = item.content;
    });

    res.json({
      ctfs_played: statsObj.ctfs_played || '0',
      security_projects: statsObj.security_projects || '0',
      writeups: statsObj.writeups || '0',
      bounties: statsObj.bounties || '0'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStats = async (req: Request, res: Response) => {
  try {
    const { ctfs_played, security_projects, writeups, bounties } = req.body;

    // Update each stat
    const stats = [
      { section: 'stats_ctfs_played', content: ctfs_played },
      { section: 'stats_security_projects', content: security_projects },
      { section: 'stats_writeups', content: writeups },
      { section: 'stats_bounties', content: bounties }
    ];

    for (const stat of stats) {
      await pool.query<ResultSetHeader>(
        `INSERT INTO profile_content (section, content) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE content = ?`,
        [stat.section, stat.content, stat.content]
      );
    }

    res.json({ message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
