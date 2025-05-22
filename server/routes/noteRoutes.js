const express = require('express');
const NoteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');
const Note = require('../models/Note');
const router = express.Router();

const noteController = new NoteController(Note);

// Create a new note
router.post('/', authMiddleware, noteController.createNote.bind(noteController));

// Get all notes for the authenticated user
router.get('/', authMiddleware, noteController.getNotes.bind(noteController));

// Get a specific note by ID
router.get('/:id', authMiddleware, noteController.getNoteById.bind(noteController));

// Update a note by ID
router.put('/:id', authMiddleware, noteController.updateNote.bind(noteController));

// Delete a note by ID
router.delete('/:id', authMiddleware, noteController.deleteNote.bind(noteController));

module.exports = router;