"use strict";

const $titleInput = $("#newStory-form-title");
const $authorInput = $("#newStory-form-author");
const $urlInput = $("#newStory-form-url");
const $likeStory = $(".favorite-tag");

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  await putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

async function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const favoriteStory = currentUser.favorites.map(storyInstance =>
    storyInstance.storyId);
  const hasBeenFavorited = favoriteStory.includes(story.storyId)
  const hostName = story.getHostName();
  const star = hasBeenFavorited===true ? `<i class="bi bi-star-fill"></i>` :
  `<i class="bi bi-star-fill"></i>`;
  console.log("star",star)
  console.log("hasBeenFavorited", hasBeenFavorited)
  return $(`
      <li id="${story.storyId}">
      ${star}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = await generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** add event listener, submitNewStory to the add story form  */
$("#newStory-form").on("submit", handleSubmitNewStory);

/** handleSubmitNewStory: submit a new story
 * - calls on the addStory method
 */
async function handleSubmitNewStory(evt) {
  evt.preventDefault();
  // pull the data from the form fields
  const title = $titleInput.val();
  const author = $authorInput.val();
  const url = $urlInput.val();
  // create a new story
  // addStory(user, newStory)
  const newStory = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });
  // create story markup
  const storyMarkup = await generateStoryMarkup(newStory);
  // display the story
  $(".stories-list").prepend(storyMarkup);
}

// get the current user's favorites using an id
async function getUserFavorites(username) {
  const token = localStorage.getItem("token");
  const {
    data: {
      user: { favorites },
    },
  } = await axios({
    url: `https://hack-or-snooze-v3.herokuapp.com/users/${username}`,
    method: "GET",
    params: {
      token,
    },
  });
  return favorites;
}


/** favorite the story, fill in the star */
function favoriteStory(e) {
  $(e.target).removeClass("bi bi-star");
  $(e.target).addClass("bi bi-star-fill");
  const storyId = $(e.target).closest("li").attr("id");
  // api call, favorite the story
  const story = storyList.stories.find(instance => instance.storyId === storyId);
  currentUser.favoritingOrUnfavoriting(story, false);
}

$allStoriesList.on("click", ".bi-star", favoriteStory);

/** unfavorite the story, unfill the star */
function unFavoriteStory(e) {
  $(e.target).removeClass("bi bi-star-fill");
  $(e.target).addClass("bi bi-star");
  const storyId = $(e.target).closest("li").attr("id");
  // api call, unfavorite the story
  const story = storyList.stories.find(instance => instance.storyId === storyId);
  currentUser.favoritingOrUnfavoriting(story, true);
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
