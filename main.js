document.addEventListener('DOMContentLoaded', function () {
  const inputBookTitle = document.getElementById('inputBookTitle');
  const inputBookAuthor = document.getElementById('inputBookAuthor');
  const inputBookYear = document.getElementById('inputBookYear');
  const inputBookIsComplete = document.getElementById('inputBookIsComplete');
  const bookSubmit = document.getElementById('bookSubmit');
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  function createBookElement(book) {
    const bookItem = document.createElement('article');
    bookItem.classList.add('book_item');
    bookItem.id = `book-${book.id}`;

    const bookTitle = document.createElement('h3');
    bookTitle.innerText = book.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis: ${book.author}`;

    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun: ${book.year}`;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    const moveButton = document.createElement('button');
    moveButton.innerText = book.isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
    moveButton.classList.add(book.isComplete ? 'green' : 'red');
    moveButton.addEventListener('click', function () {
      moveBook(book);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus buku';
    deleteButton.classList.add('red');
    deleteButton.addEventListener('click', function () {
      removeBook(book);
    });

    actionContainer.appendChild(moveButton);
    actionContainer.appendChild(deleteButton);

    bookItem.appendChild(bookTitle);
    bookItem.appendChild(bookAuthor);
    bookItem.appendChild(bookYear);
    bookItem.appendChild(actionContainer);

    return bookItem;
  }
  
  function addBook() {
    const title = inputBookTitle.value;
    const author = inputBookAuthor.value;
    const year = parseInt(inputBookYear.value, 10); 
    const isComplete = inputBookIsComplete.checked;

    const newBook = {
      id: `${+new Date()}`, 
      title,
      author,
      year,
      isComplete,
    };

    const bookshelfList = isComplete ? completeBookshelfList : incompleteBookshelfList;
    const bookElement = createBookElement(newBook);
    bookshelfList.appendChild(bookElement);

    saveData();
    clearForm();
  }

  function moveBook(book) {
    const targetBookshelf = book.isComplete ? incompleteBookshelfList : completeBookshelfList;
    const oppositeBookshelf = book.isComplete ? completeBookshelfList : incompleteBookshelfList;

    book.isComplete = !book.isComplete;

    const updatedBookElement = createBookElement(book);
    targetBookshelf.appendChild(updatedBookElement);

    const bookItemToRemove = document.getElementById(`book-${book.id}`);
    oppositeBookshelf.removeChild(bookItemToRemove);

    saveData();
  }

  function removeBook(book) {
    const bookshelfList = book.isComplete ? completeBookshelfList : incompleteBookshelfList;
    const bookItemToRemove = document.getElementById(`book-${book.id}`);
    bookshelfList.removeChild(bookItemToRemove);

    // Hapus data buku dari localStorage
    removeData(book.id);

    saveData();
  }

  function removeData(id) {
    const incompleteBooks = JSON.parse(localStorage.getItem('incompleteBooks')) || [];
    const completeBooks = JSON.parse(localStorage.getItem('completeBooks')) || [];

    const updatedIncompleteBooks = incompleteBooks.filter(book => book.id !== id);
    const updatedCompleteBooks = completeBooks.filter(book => book.id !== id);

    localStorage.setItem('incompleteBooks', JSON.stringify(updatedIncompleteBooks));
    localStorage.setItem('completeBooks', JSON.stringify(updatedCompleteBooks));
  }

  function saveData() {
    const incompleteBooks = Array.from(incompleteBookshelfList.children).map(element => {
      return {
        id: +element.id.split('-')[1],
        title: element.querySelector('h3').innerText,
        author: element.querySelector('p:nth-child(2)').innerText.split(': ')[1],
        year: parseInt(element.querySelector('p:nth-child(3)').innerText.split(': ')[1], 10),
        isComplete: false,
      };
    });
  
    const completeBooks = Array.from(completeBookshelfList.children).map(element => {
      return {
        id: +element.id.split('-')[1],
        title: element.querySelector('h3').innerText,
        author: element.querySelector('p:nth-child(2)').innerText.split(': ')[1],
        year: parseInt(element.querySelector('p:nth-child(3)').innerText.split(': ')[1], 10),
        isComplete: true,
      };
    });
  
    localStorage.setItem('incompleteBooks', JSON.stringify(incompleteBooks));
    localStorage.setItem('completeBooks', JSON.stringify(completeBooks));
  }  

  function loadData() {
    const incompleteBooks = JSON.parse(localStorage.getItem('incompleteBooks')) || [];
    const completeBooks = JSON.parse(localStorage.getItem('completeBooks')) || [];
  
    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';
  
    incompleteBooks.forEach(book => {
      const bookElement = createBookElement(book);
      incompleteBookshelfList.appendChild(bookElement);
    });
  
    completeBooks.forEach(book => {
      const bookElement = createBookElement(book);
      bookElement.classList.add('finished');
      completeBookshelfList.appendChild(bookElement);
    });
  }  

  function clearForm() {
    inputBookTitle.value = '';
    inputBookAuthor.value = '';
    inputBookYear.value = '';
    inputBookIsComplete.checked = false;
  }

  document.getElementById('inputBook').addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
  });

  function filterBooks(query) {
    const allBooks = Array.from(incompleteBookshelfList.children)
      .concat(Array.from(completeBookshelfList.children));

    allBooks.forEach(book => {
      const title = book.querySelector('h3').innerText.toLowerCase();
      const author = book.querySelector('p:nth-child(2)').innerText.split(': ')[1].toLowerCase();
      const year = book.querySelector('p:nth-child(3)').innerText.split(': ')[1].toString();

      const match = title.includes(query) || author.includes(query) || year.includes(query);
      book.style.display = match ? 'block' : 'none';
    });
  }

  document.getElementById('searchBook').addEventListener('submit', function (e) {
    e.preventDefault();
    const searchInput = document.getElementById('searchBookTitle');
    const query = searchInput.value.toLowerCase();
    filterBooks(query);
  });

  // Tambahkan event listener untuk menghapus buku
  incompleteBookshelfList.addEventListener('click', function (e) {
    const deleteButton = e.target.closest('.red');
    if (deleteButton) {
      const bookItem = deleteButton.closest('.book_item');
      const bookId = +bookItem.id.split('-')[1];
      removeBook({ id: bookId });
    }
  });

  completeBookshelfList.addEventListener('click', function (e) {
    const deleteButton = e.target.closest('.red');
    if (deleteButton) {
      const bookItem = deleteButton.closest('.book_item');
      const bookId = +bookItem.id.split('-')[1];
      removeBook({ id: bookId });
    }
  });

  loadData();
});
