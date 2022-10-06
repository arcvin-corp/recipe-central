class SearchView {
  #parentElement = document.querySelector('.search');

  getQuery() {
    const queryValue =
      this.#parentElement.querySelector('.search__field').value;
    this.#clearInput();
    return queryValue;
  }

  addHandlerSearch(handler) {
    this.#parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }

  #clearInput() {
    this.#parentElement.querySelector('.search__field').value = '';
  }
}

export default new SearchView();
