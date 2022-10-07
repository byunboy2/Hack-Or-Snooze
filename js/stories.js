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

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

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

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
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
  const storyMarkup = generateStoryMarkup(newStory);
  // display the story
  $(".stories-list").prepend(storyMarkup);
}
