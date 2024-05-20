export class Table {
    root;
    constructor(locator) {
      this.root = locator;
    }
  
    async getAllRows() {
      // Get all rows by rowgroup role
      return await this.root.locator("[role='rowgroup']").all(); // When the locator points to a list of elements, this returns an array of locators, pointing to their respective elements.
      // const rowGroup = await this.root.locator("[role='rowgroup']");
      // return await rowGroup.locator("[role='row']").all();
    }
    async getBookTitle() {
      // Recieve list of all titles
      const books = await this.getAllRows();
      for (let i = 1; i <= books.length; i++) {
        const bookCells = await books[i - 1].locator("[role='gridcell']").all();
        const bookCell = bookCells[1]; //All info for the element 1 for index = i
        const bookTitle = await bookCell.locator("a").allInnerTexts();
        if (bookTitle != "") {
          console.log("Book title #" + i + " = " + bookTitle);
        }
      }
    }
    async getBookTitleToBeReturned() {
      // Recieve list of all titles
      const books = await this.getAllRows();
      let bookTitlesArray = [];
      for (let i = 1; i <= books.length; i++) {
        const bookCells = await books[i - 1].locator("[role='gridcell']").all();
        const bookCell = bookCells[1]; //All info for the element 1 for index = i
        const bookTitle = await bookCell.locator("a").allInnerTexts();
        if (bookTitle != "") {
          console.log("Book title #" + i + " = " + bookTitle);
          bookTitlesArray.push(bookTitle);
        }
      }
      // console.log("show array -> " + bookTitlesArray);
      return bookTitlesArray;
    }
    async getBookAuthor() {
      // Recieve list of all titles
      const books = await this.getAllRows();
  
      for (let i = 1; i <= books.length; i++) {
        const bookCell = await books[i - 1]
          .locator("[role='gridcell']")
          .allInnerTexts();
  
        const bookAuthor = bookCell[2].trim();
        if (bookAuthor != "") {
          // OR we can use next condition -> if (bookAuthor.length > 1) {
          console.log("Book " + i + " has author - " + bookAuthor);
        }
      }
    }
    async getBookPublisher() {
      // Recieve list of all titles
      const books = await this.getAllRows();
      let listOfPublishers;
  
      // option number 1 with Promise.all
      let t1 = performance.now();
      const listOfRows = books.map((book) =>
        book.locator("[role='gridcell']").allInnerTexts()
      ); // тут проміси
      const listOfRowsValues = await Promise.all(listOfRows);
      const notEmptyRow = listOfRowsValues.map((row) => row[3].trim());
      listOfPublishers = notEmptyRow.filter((cell) => cell != "");
      let t2 = performance.now();
      // check performance
      console.log("Performance results for option #1 = " + (t2 - t1) + " ms");
  
      // option number 2 with for loop
      t1 = performance.now();
      for (let i = 1; i <= books.length; i++) {
        const bookCell = await books[i - 1]
          .locator("[role='gridcell']")
          .allInnerTexts();
        const bookPublisher = bookCell[3].trim();
        if (bookPublisher != "") {
          console.log("Book " + i + " is published by - " + bookPublisher);
          listOfPublishers.push(bookPublisher);
        }
      }
      t2 = performance.now();
      // check performance
      console.log("Performance results for option #2 = " + (t2 - t1) + " ms");
      
      // List of unique publishers
      const listInSet = new Set(listOfPublishers);
      const convertFromObjectIntoArray = Array.from(listInSet).join(', ');
      console.log("Convert results from object into array -> " + convertFromObjectIntoArray);
  
      console.log("List of unique publishers -> " + convertFromObjectIntoArray);
      return convertFromObjectIntoArray;
    }
  }