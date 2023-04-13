"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodesList = $("#episodes-list");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const results = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);
  return results.data;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div class="col-md-6 col-lg-3 mb-4 Show" data-show-id="${show.show.id}">
         <div class="card" data-show-id="${show.show.id}">
           <img class="card-img-top" src="${checkForImage(show.show)}">
           <div class="card-body">
              <h5 class="text-primary card-title">${show.show.name}</h5>
              <p class="card-text">${checkForSummary(show.show)}</p>
              <button class="btn btn-primary get-episodes">Episodes</button>
            </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

function checkForImage(show) {
  try {
    return show.image.original;
  }
  catch {
    return "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg";
  }
}

function checkForSummary(show) {
  try {
    if (show.summary === null) {
      return "No Summary was found for this title."
    }
    return show.summary;
  } catch {
    return "No Summary was found for this title.";
  }
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }))

  return { ep: episodes, totalSeasons: episodes[episodes.length - 1].season };
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes, seasons, showName) {
  $episodesList.empty();

  const $seasonTable = (`<table id="${showName}" class="table table-bordered table-sm">
          <thead class="text-center">
            <tr>
              <th colspan="2" scope="row">${showName}</th>
            </tr>
            <tr>
              <th scope="col">Season</th>
              <th scope="col">Episodes</th>
            </tr>
          </thead>
          <tbody id="add-episode" class="text-center">
          </tbody>
        </table>`);

  $episodesList.append($seasonTable);

  for (let i = 1; i <= seasons; i++) {
    let $season = $(`
    <tr>
      <th scope="row">Season ${i}</th>
      <td id="season${i}" class="text-start px-4"></td>
    </tr>`)
    $('#add-episode').append($season);
    for (let episode of episodes) {
      if (episode.season === i) {
        $(`#season${i}`).append(`${episode.number}. ${episode.name}<br>`);
      } else continue;
    }
  }
  $episodesArea.show();
}



$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(evt) {
  let showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodes(showId);
  populateEpisodes(episodes.ep, episodes.totalSeasons, evt.target.parentElement.children[0].innerText);
});