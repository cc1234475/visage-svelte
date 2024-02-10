<script>
  import { onMount } from "svelte";

  import { Tab, TabList, TabPanel, Tabs } from "svelte-tabs";
  import { fly } from "svelte/transition";
  import {
    createPerformer,
    getPerformerDataFromStashID,
    getPerformers,
    getPerformersForImage,
    getPerformersForScene,
    getScenarioAndID,
    getStashboxEndpoint,
    smoothload,
    updateImage,
    updateScene,
  } from "./utils";

  export let matches = [];

  let matchesSelected = 0;
  let visible = false;
  let modal;

  onMount(() => {
    visible = true;
  });

  async function close() {
    visible = false;
    setTimeout(() => {
      modal.remove();
    }, 400);
  }

  function toggle() {
    modal.style.opacity = modal.style.opacity == "0.1" ? "1.0" : "0.1";
  }

  async function addPerformer(current, id_) {
    var performers = await getPerformers(id_);
    current.classList.add("assigned");
    // if the users doesn't have a performer with the same stash id, get the data from stash box and create a new performer
    if (performers.length === 0) {
      var performer = await getPerformerDataFromStashID(id_);

      if (performer === undefined) {
        current.classList.remove("assigned");
        alert("Could not retrieve performer data from stash box");
        return;
      }

      performer.image = performer.images[0];
      var endpoint = await getStashboxEndpoint();

      // delete some fields that are not needed and will not be accepted by local stash instance
      delete performer.images;
      delete performer.remote_site_id;

      if (performer.height) {
        performer.height_cm = performer.height;
        delete performer.height;
      }
      if (performer.aliases) {
        performer.alias_list = performer.aliases;
        delete performer.aliases;
      }
      
      // Remove attributes that are set to null
      Object.keys(performer).forEach((key) => {
        if (performer[key] === null) {
          delete performer[key];
        }
      });

      performer.stash_ids = [{ endpoint: endpoint, stash_id: id_ }];

      id_ = await createPerformer(performer);
      if ("errors" in id_) {
        current.classList.remove("assigned");
        alert("Error while creating performer:" + id_.errors[0].message);
        return;
      }
      id_ = id_.data.performerCreate.id;
    } else {
      id_ = performers[0].id;
    }

    let [scenario, scenarioId] = getScenarioAndID();
    var performIds;

    if (scenario === "scenes") {
      performIds = await getPerformersForScene(scenarioId);

      if (performIds.includes(id_)) {
        current.classList.remove("assigned");
        alert("Performer already assigned to scene");
        return;
      }

      performIds.push(id_);
      await updateScene(scenarioId, performIds);
    } else if (scenario === "images") {
      performIds = await getPerformersForImage(scenarioId);

      if (performIds.includes(id_)) {
        current.classList.remove("assigned");
        alert("Performer already assigned to image");
        return;
      }

      performIds.push(id_);
      await updateImage(scenarioId, performIds);
    }

    matchesSelected += 1;

    if (matchesSelected === matches.length) {
      close();
      window.location.reload();
    }
  }
</script>

{#if visible}
  <div
    bind:this={modal}
    role="dialog"
    aria-modal="true"
    class="fade ModalComponent modal show"
    tabindex="-1"
    style="display: block"
    in:fly={{ y: 100, duration: 400 }}
    out:fly={{ y: -100, duration: 400 }}
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-body">
          <Tabs>
            <TabList>
              {#each matches as face, i (face.image)}
                <Tab>
                  <img
                    src="data:image/jpg;base64,{face.image}"
                    alt=""
                    class="face-tab"
                  />
                </Tab>
              {/each}
            </TabList>

            {#each matches as face, i (face.image)}
              {@const performers = face.performers}
              <TabPanel>
                <div class="row">
                  <div class="carousel">
                    {#each performers as match, i (match.id)}
                      <div
                        draggable="false"
                        class="performer-card grid-card card"
                        id="face-{i}"
                        on:click={(event) =>
                          addPerformer(event.target, match.id)}
                        on:keypress={(event) =>
                          addPerformer(event.target, match.id)}
                      >
                        <div class="thumbnail-section">
                          <img
                            class="performer-card-image"
                            alt={match.name}
                            src={match.image}
                            use:smoothload
                          />
                          <span
                            class="performer-card__country-flag fi fi-{match.country?.toLowerCase()}"
                          />
                        </div>
                        <div class="card-section">
                          <h5 class="card-section-title flex-aligned">
                            <div style="-webkit-line-clamp: 2">
                              <a
                                href="https://stashdb.org/performers/{match.id}"
                                target="_blank"
                              >
                                {match.name}
                              </a>
                              <span class="tag-item badge badge-pill"
                                ><div>{match.confidence}%</div></span
                              >
                            </div>
                          </h5>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              </TabPanel>
            {/each}
          </Tabs>
        </div>
        <div class="ModalFooter modal-footer">
          <div>
            <button
              id="face_close"
              type="button"
              on:click={close}
              class="ml-2 btn btn-secondary">Close</button
            >
            <button
              id="face_toggle"
              type="button"
              on:click={toggle}
              class="ml-2 btn btn-secondary">Toggle Visibility</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .carousel {
    display: flex;
    overflow-x: auto;
    overflow-y: auto;
    white-space: nowrap;
    overscroll-behavior-x: contain;
    overscroll-behavior-y: contain;
    scroll-snap-type: x mandatory;
    gap: 1rem;
  }

  .modal-header {
    font-size: 2.4rem;
    border-bottom: 0px;
    padding: 10px 10px 0px 10px;
  }

  .modal-footer {
    border-top: 0px;
  }

  ::-webkit-scrollbar {
    width: 30px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--orange);
    border-radius: 20px;
  }

  .card {
    min-width: 250px;
  }

  .performer-card {
    cursor: pointer;
  }

  .assigned {
    border: 5px solid var(--green);
    animation: border 1s ease-in-out;
  }

  .face-tab {
    width: 50px;
    height: 50px;
    object-fit: cover;
  }
</style>
