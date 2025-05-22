class NoteController {
    constructor(Note) {
        this.Note = Note;
    }

    async createNote(req, res) {
        const { title, content, category } = req.body;
        try {
            const newNote = new this.Note({
                title,
                content,
                createdAt: new Date(),
                category,
                userId: req.user.id // Assuming user ID is attached to req by auth middleware
            });
            await newNote.save();
            res.status(201).json(newNote);
        } catch (error) {
            res.status(500).json({ message: 'Error creating note', error });
        }
    }

    async getNotes(req, res) {
        try {
            const notes = await this.Note.find({ userId: req.user.id });
            res.status(200).json(notes);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching notes', error });
        }
    }

    async getNoteById(req, res) {
        try {
            const notes = await this.Note.find({ _id: req.note.id });
            res.status(200).json(notes);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching notes', error });
        }
    }


    async updateNote(req, res) {
        const { id } = req.params;
        const { title, content, category } = req.body;
        try {
            const updatedNote = await this.Note.findByIdAndUpdate(
                { "_id": id },
                { title, content, category },
                { new: true }
            );
            if (!updatedNote) {
                return res.status(404).json({ message: 'Note not found' });
            }
            res.status(200).json(updatedNote);
        } catch (error) {
            res.status(500).json({ message: 'Error updating note', error });
        }
    }

    async deleteNote(req, res) {
        const { id } = req.params;
        try {
            const deletedNote = await this.Note.findByIdAndDelete({ "_id": id });
            if (!deletedNote) {
                return res.status(404).json({ message: 'Note not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting note', error });
        }
    }
}

module.exports = NoteController;