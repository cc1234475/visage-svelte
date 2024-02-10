<script lang="ts">
  import { getScenarioAndID, getUrlSprite, VISAGE_API_URL } from "./utils";
  import Faces from "./Faces.svelte";

  let scanner = false;

  async function download(url) {
    const vblob = await fetch(url).then((res) => res.blob());
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(vblob);
    });
  }

  async function getFaces() {
    scanner = true;
    const [, scene_id] = getScenarioAndID();
    let url = await getUrlSprite(scene_id);

    if (!url) {
      alert(
        "No sprite found, please ensure you have sprites enabled and generated for your scenes."
      );
      scanner = false;
      return;
    }

    // get image blob
    let image = await download(url);

    // get vtt blob
    const vtt_url = url.replace("_sprite.jpg", "_thumbs.vtt");
    let vtt = await download(vtt_url);
    // query the api with a threshold of 0.4 as we want to do the filtering ourselves
    var data = { data: [image, vtt] };
    fetch(VISAGE_API_URL + "_3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data),
      })
      .then((response) => {
        if (response.status !== 200) {
          scanner = false;
          alert(
            "Something went wrong. It's likely a server issue, Please try again later."
          );
          return;
        }
        return response.json();
      })
      .then((data) => {
        scanner = false;
        // find a div with class row
        let row = document.querySelector(".row");
        new Faces({
          target: row,
          props: { frames: data.data[0], url: url },
        });
      })
      .catch((error) => {
        scanner = false;
        if (error.message === "") {
          alert("Error: Service may be down. please try again later.");
        } else {
          alert("Error: " + error.message);
        }
      });
  }
</script>

<button on:click={getFaces} class:scanner id="faces">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    ><path
      d="M17,10.5L21,6.5V17.5L17,13.5V17A1,1 0 0,1 16,18H4A1,1 0 0,1 3,17V7A1,1 0 0,1 4,6H16A1,1 0 0,1 17,7V10.5M14,16V15C14,13.67 11.33,13 10,13C8.67,13 6,13.67 6,15V16H14M10,8A2,2 0 0,0 8,10A2,2 0 0,0 10,12A2,2 0 0,0 12,10A2,2 0 0,0 10,8Z"
    /></svg
  >
</button>

<style>
  button {
    background-color: var(--nav-color);
    border: 0px;
  }

  .scanner {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 var(--light);
    }

    70% {
      transform: scale(1.1);
      box-shadow: 0 0 0 10px var(--info);
    }

    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 var(--primary);
    }
  }
  svg {
    fill: #ffffff;
  }
</style>
