let cart = [];

// ✅ Fetch and display all books
async function fetchBooks() {
  const container = document.getElementById("books-container");
  if (!container) return;

  const res = await fetch("/api/books/get");
  const data = await res.json();

  container.innerHTML = "";

  if (!data.success || data.data.length === 0) {
    container.innerHTML = "<p>No books found.</p>";
    return;
  }

  // 🔄 Reverse array so newest appears last
  const books = data.data.reverse();

  books.forEach((book) => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6";

    const div = document.createElement("div");
    div.classList.add("book-card");

    div.innerHTML = `
      <img src="/uploads/${book.image}" alt="${book.title}" class="book-img">
      <h3>${book.title}</h3>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Year:</strong> ${book.year}</p>
      <p><strong>Price:</strong> ₹${book.price}</p>
      <button onclick="deleteBook('${book._id}')" class="btn btn-danger btn-sm">🗑 Delete</button>
      <button onclick="window.location.href='updateBook.html?id=${book._id}'" class="btn btn-warning btn-sm">✏️ Update</button>
      <button onclick="addToCart('${book._id}', '${book.title}', ${book.price}, '${book.image}')" class="btn btn-success btn-sm">🛒 Add to Cart</button>
    `;

    col.appendChild(div);
    container.appendChild(col);
  });
}


// ✅ Add new book
const addBookForm = document.getElementById("addBookForm");

if (addBookForm) {
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(addBookForm);

    try {
      const res = await fetch("/api/books/add", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Book added successfully!");
        addBookForm.reset();

        // redirect to home after small delay
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      } else {
        alert("❌ Failed to add book: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Server error occurred.");
    }
  });
}

// ✅ Update book
const updateBookForm = document.getElementById("updateBookForm");
if (updateBookForm) {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  async function loadBook() {
    const res = await fetch(`/api/books/get/${bookId}`);
    const result = await res.json();
    if (result.success) {
      const book = result.data;
      document.getElementById("title").value = book.title;
      document.getElementById("author").value = book.author;
      document.getElementById("year").value = book.year;
      document.getElementById("price").value = book.price;
      document.getElementById("previewImage").src = `/uploads/${book.image}`;
    }
  }

  updateBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(updateBookForm);
    const imageFile = document.getElementById("image").files[0];
    if (imageFile) formData.append("image", imageFile);

    const res = await fetch(`/api/books/update/${bookId}`, { method: "PUT", body: formData });
    const result = await res.json();

    alert(result.message || (result.success ? "Updated" : "Failed"));
    if (result.success) window.location.href = "index.html";
  });

  loadBook();
}

// ✅ Cart functionality
function addToCart(id, title, price, image) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, title, price, image, quantity: 1 });
  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById("cart-container");
  if (!cartContainer) return;

  cartContainer.innerHTML = "";
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 🛒</p>";
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="/uploads/${item.image}" class="cart-img">
        <div><strong>${item.title}</strong><br>₹${item.price}</div>
        <div>
          <button onclick="updateQuantity(${index}, -1)">➖</button>
          ${item.quantity}
          <button onclick="updateQuantity(${index}, 1)">➕</button>
        </div>
        <div>₹${itemTotal}</div>
      </div>
    `;
  });

  cartContainer.innerHTML += `<div class="cart-summary">Total: ₹${total}</div>`;
}

function updateQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  renderCart();
}

async function deleteBook(id) {
  if (confirm("Are you sure to delete this book?")) {
    const res = await fetch(`/api/books/delete/${id}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.message);
    fetchBooks();
  }
}

// ✅ Initialize
fetchBooks();
