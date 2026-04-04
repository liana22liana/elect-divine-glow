const router = require('express').Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const sections = await pool.query('SELECT id, name, icon, order_index FROM library_sections ORDER BY order_index');
    const subsections = await pool.query('SELECT id, section_id, name, order_index FROM library_subsections ORDER BY order_index');
    const result = sections.rows.map(s => ({
      ...s,
      subsections: subsections.rows.filter(sub => sub.section_id === s.id),
    }));
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
