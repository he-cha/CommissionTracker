const express = require('express');
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sales for user
router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sale
router.post('/', auth, async (req, res) => {
  try {
    const sale = new Sale({ ...req.body, userId: req.user.id });
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update sale
router.put('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete sale
router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;