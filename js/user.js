"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

const $pipes = $(".pipe");
const $navSubmit = $("#nav-submit");
const $navUserFavorites = $("#nav-user-favorites");

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // show the logged in buttons
  showLoggedInButtons();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  // show the logged in buttons
  showLoggedInButtons();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  // hide the pipes, nav submit button, user favorites button
  unshowLoggedInButtons();

  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

/** favorite the story, fill in the star */
function favoriteStory(e) {
  $(e.target).removeClass("bi bi-star");
  $(e.target).addClass("bi bi-star-fill");
  const storyId = $(e.target).closest("li").attr("id");
  // api call, favorite the story
  currentUser.favoritingOrUnfavoriting(storyId, false);
}

$allStoriesList.on("click", ".bi-star", favoriteStory);

/** unfavorite the story, unfill the star */
function unFavoriteStory(e) {
  $(e.target).removeClass("bi bi-star-fill");
  $(e.target).addClass("bi bi-star");
  const storyId = $(e.target).closest("li").attr("id");
  // api call, unfavorite the story
  currentUser.favoritingOrUnfavoriting(storyId, true);
}

$allStoriesList.on("click", ".bi-star-fill", unFavoriteStory);

// shows the pipes, favorites, submit buttons
function showLoggedInButtons() {
  // unhide pipes, submit button, nav user favorites button
  $pipes.show();
  $navSubmit.show();
  $navUserFavorites.show();
}

// unshows the pipes, favorites, submit buttons
function unshowLoggedInButtons() {
  // unhide pipes, submit button, nav user favorites button
  $pipes.hide();
  $navSubmit.hide();
  $navUserFavorites.hide();
}
