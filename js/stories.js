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

  // TODO make favorited story, star show up
  // const username = localStorage.getItem("username");

  // let favoritesIds;

  // if (username) {
  //   // make api call, get the current user
  //   favoritesIds = (await getUserFavorites(username)).map(
  //     ({ storyId }) => storyId
  //   );
  // }

  // // user exists and
  // const isFavorited = username && favoritesIds.includes(story.storyId);

  // // favorite star type
  // const favoriteStar = isFavorited
  //   ? '<i class="bi bi-star-fill"></i>'
  //   : '<i class="bi bi-star"></i>';

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
      <i class="bi bi-star"></i>
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
