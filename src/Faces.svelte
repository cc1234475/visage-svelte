<script lang="ts">
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import SearchFaces from "./SearchFaces.svelte";
  import type { Frame } from "./types";

  export let url = "";
  export let frames: Frame[] = [];

  let self;
  let selected = null;
  let calls;

  function getCurrentVideo(): HTMLVideoElement {
    return document.querySelector("#VideoJsPlayer_html5_api");
  }

  async function close() {
    self.remove();
  }

  function select(frame) {
    if (selected === frame.id) {
      calls.recog();
    } else {
      selected = frame.id;
      playVideoAtTime(frame.time);
    }
  }

  async function playVideoAtTime(time) {
    const video = getCurrentVideo();
    await video.play();
    video.currentTime = time;
    await video.pause();
  }
</script>

<div bind:this={self} class="face-tabs">
  <div class="modal-dialog modal-xl top-accent">
    <div class="modal-content">
      <div class="ModalFooter modal-header">
        <div>
          <SearchFaces bind:calls={calls}/>
          <button
            id="tags-cancel"
            type="button"
            on:click={close}
            class="ml-2 btn btn-secondary">Close</button
          >
        </div>
      </div>
      <div class="modal-body">
        <div class="row justify-content-center">
          {#each frames as frame (frame.id)}
            <div
              class:selected={selected === frame.id}
              out:fade
              in:fade
              animate:flip={{ duration: 250, easing: quintOut }}
            >
              <div style="padding: 10px;">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="face-item"
                  on:click={() => {
                    select(frame);
                  }}
                  style="background-position: -{frame.offset[0]}px -{frame
                    .offset[1]}px; background-image: url('{url}');"
                  data-offset={frame.offset}
                />
              </div>
            </div>
          {/each}
        </div>
      </div>

    </div>
  </div>
</div>

<style>
  .modal-footer {
    border-bottom: 0px;
  }

  .selected {
    border: 2px solid #007bff;
  }

  .face-tabs {
    position: absolute;
    flex: 0 0 450px;
    max-width: 450px;
    min-width: 450px;
    height: 100%;
    overflow: auto;
    order: -1;
    background-color: var(--body-color);
  }

  .face-item {
    width: 160px;
    height: 90px;
    border-radius: 5px 5px 0px 0px;
    position: relative;
    cursor: pointer;
  }
</style>
