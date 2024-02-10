export let VISAGE_API_URL = "_VISAGE_API_URL";
export let THRESHOLD = 20.0; // remove matches with a distance higher than this
export let MAX_RESULTS = 12; // number of results to show, don't change this for now


export function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function getScenarioAndID() {
  var result = document.URL.match(/(scenes|images)\/(\d+)/);
  var scenario = result[1];
  var scenario_id = result[2];
  return [scenario, scenario_id];
}

export async function getPerformers(performer_id) {
  const reqData = {
    query: `{
      findPerformers( performer_filter: {stash_id_endpoint: {endpoint: "", stash_id: "${performer_id}", modifier: EQUALS}}){
        performers {
          name
          id
        }
      }
    }`,
  };
  var results = await stash.callGQL(reqData);
  return results.data.findPerformers.performers;
}

export async function getPerformersForScene(scene_id) {
  const reqData = {
    query: `{
      findScene(id: "${scene_id}") {
        performers {
          id
        }
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  return result.data.findScene.performers.map((p) => p.id);
}


export async function getPerformersForImage(image_id) {
  const reqData = {
    query: `{
      findImage(id: "${image_id}") {
        performers {
          id
        }
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  return result.data.findImage.performers.map((p) => p.id);
}


export async function updateScene(scene_id, performer_ids) {
  const reqData = {
    variables: { input: { id: scene_id, performer_ids: performer_ids } },
    query: `mutation sceneUpdate($input: SceneUpdateInput!){
      sceneUpdate(input: $input) {
        id
      }
    }`,
  };
  return stash.callGQL(reqData);
}


export async function updateImage(image_id, performer_ids) {
  const reqData = {
    variables: { input: { id: image_id, performer_ids: performer_ids } },
    query: `mutation imageUpdate($input: ImageUpdateInput!){
      imageUpdate(input: $input) {
        id
      }
    }`,
  };
  return stash.callGQL(reqData);
}

export async function getStashboxEndpoint() {
  const reqData = {
    query: `{
      configuration {
        general {
          stashBoxes {
            endpoint
          }
        }
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  return result.data.configuration.general.stashBoxes[0].endpoint;
}

export async function getPerformerDataFromStashID(stash_id) {
  const reqData = {
    variables: {
      source: {
        stash_box_index: 0,
      },
      input: {
        query: stash_id,
      },
    },
    query: `query ScrapeSinglePerformer($source: ScraperSourceInput!, $input: ScrapeSinglePerformerInput!) {
        scrapeSinglePerformer(source: $source, input: $input) {
            name
            disambiguation
            gender
            url
            twitter
            instagram
            birthdate
            ethnicity
            country
            eye_color
            height
            measurements
            fake_tits
            career_length
            tattoos
            piercings
            aliases
            images
            details
            death_date
            hair_color
            weight
            remote_site_id
        }
      }`,
  };
  var result = await stash.callGQL(reqData);
  return result.data.scrapeSinglePerformer.filter(
    (p) => p.remote_site_id === stash_id
  )[0];
}

export async function createPerformer(performer) {
  const reqData = {
    variables: { input: performer },
    query: `mutation performerCreate($input: PerformerCreateInput!) {
        performerCreate(input: $input){
            id
        }
      }`,
  };
  return stash.callGQL(reqData);
}

export function smoothload(node) {
	function load() {
		if (node.naturalWidth) return; // already loaded

		node.style.opacity = '0';
		node.style.transition = 'opacity 0.4s';

		node.addEventListener(
			'load',
			() => {
				node.style.opacity = '1';
			},
			{
				once: true
			}
		);
	}

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.attributeName === 'src') {
				load();
			}
		}
	});

	observer.observe(node, {
		attributes: true
	});

	load();

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

/**
 * Retrieves the URL of the sprite for a given scene ID.
 * @param {number} scene_id - The ID of the scene to retrieve the sprite URL for.
 * @returns {Promise<string|null>} - A Promise that resolves with the sprite URL if it exists, or null if it does not.
 */
export async function getUrlSprite(scene_id) {
  const reqData = {
    query: `{
      findScene(id: ${scene_id}){
        paths{
          sprite
        }
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  const url = result.data.findScene.paths["sprite"];
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  } else {
    return result.data.findScene.paths["sprite"];
  }
}
