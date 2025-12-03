const Book = require('../models/books');

// 📚 Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📘 Get single book
exports.getsingleBookId = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)
      return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➕ Add new book
exports.addNewBook = async (req, res) => {
  try {
    const { title, author, year, price } = req.body;
    const image = req.file ? req.file.filename : '';

    if (!title || !author || !year || !price) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const newBook = new Book({ title, author, year, price, image });
    await newBook.save();
    res.status(201).json({ success: true, message: 'Book added', data: newBook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✏️ Update book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, year, price } = req.body;

    // Create object only with non-empty fields
    const updateData = {};
    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (year) updateData.year = year;
    if (price) updateData.price = price;

    // if image uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // If no fields provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, message: 'Book updated successfully', data: updatedBook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🗑️ Delete book
exports.deletebook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook)
      return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
