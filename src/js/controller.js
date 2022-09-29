import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// For parcel hot reloading
// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Loading recipe
    recipeView.renderSpinner();

    // Fetch recipe
    await model.loadRecipe(id);

    // Render the recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // Get search query from user input
    const query = searchView.getQuery();
    if (!query) return;

    // Loading results
    resultsView.renderSpinner();

    // Load search results
    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage(2));

    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
};

init();
