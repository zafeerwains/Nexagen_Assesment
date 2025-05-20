const express = require('express');
const NoteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');
const Note = require('../models/Note');
const router = express.Router();
const noteController = new NoteController(Note);

// Create a new note
router.post('/', authMiddleware, noteController.createNote);

// Get all notes for the authenticated user
router.get('/', authMiddleware, noteController.getNotes);

// Get a specific note by ID
// router.get('/:id', authMiddleware, noteController.getNoteById);

// Update a note by ID
router.put('/:id', authMiddleware, noteController.updateNote);

// Delete a note by ID
router.delete('/:id', authMiddleware, noteController.deleteNote);

module.exports = router;