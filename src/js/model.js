import { async } from 'regenerator-runtime';
import { API_URL, API_KEY, RES_PER_PAGE } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  return {
    id: data.id,
    title: data.title,
    publisher: data.publisher,
    sourceUrl: data.source_url,
    image: data.image_url,
    servings: data.servings,
    cookingTime: data.cooking_time,
    ingredients: data.ingredients,
    ...(data.key && { key: data.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data.data.recipe);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    throw error;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    // Always set the page variable to 1 when loading new search results
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  // Update the servings in the main state
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const loadBookmarkFromLocalStorage = function () {
  const bookmarks = localStorage.getItem('bookmarks');
  if (!bookmarks || bookmarks.length === 0) return;
  state.bookmarks = [...JSON.parse(localStorage.getItem('bookmarks'))];
};

export const addBookmark = function (recipe) {
  // Add to bookmarks array
  state.bookmarks.push(recipe);
  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  // Update local storage
  persistBookmarks();
};

/**
 * Delete a bookmarked recipe
 * @param {Number} id ID value of the recipe
 */
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(recipe => recipe.id === id);
  // Delete item from bookmarks array
  state.bookmarks.splice(index, 1);
  // Unmark current recipe as bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  // Update local storage
  persistBookmarks();
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1])
      .map(ing => {
        const ingArr = ing[1].split(',').map(e => e.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please check the submitted ingredient data.'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data.data.recipe);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};
