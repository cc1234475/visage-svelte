<script>
  import { getScenarioAndID, VISAGE_API_URL, THRESHOLD,MAX_RESULTS  } from "./utils";
  import Match from "./Match.svelte";
  import html2canvas from "html2canvas";

  let scanner = false;

  function recognize() {
    let [scenario] = getScenarioAndID();
    let selector;
    if (scenario === "scenes") {
      selector = "#VideoJsPlayer";
    } else if (scenario === "images") {
      selector = ".image-image";
    }

    html2canvas(document.querySelector(selector)).then((canvas) => {
      scanner = true;
      let image = canvas.toDataURL("image/jpg");
      let data = { data: [image, THRESHOLD, MAX_RESULTS] };

      fetch(VISAGE_API_URL + "_1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          console.log(response.responseText);
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
          if (data.data[0].length === 0) {
            alert("No matches found");
            return;
          }
          new Match({
            target: document.body,
            props: { matches: data.data[0] },
          });
        })
        .catch((error) => {
          scanner = false;
          alert("Error: " + error.message);
        });
    });
  }

  export const calls = {
    recog() {
      recognize();
    }
  };
</script>

<button on:click={recognize} class:scanner id="visage">
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"  viewBox="0 0 24 24">
    <path d="M9,11.75A1.25,1.25 0 0,0 7.75,13A1.25,1.25 0 0,0 9,14.25A1.25,1.25 0 0,0 10.25,13A1.25,1.25 0 0,0 9,11.75M15,11.75A1.25,1.25 0 0,0 13.75,13A1.25,1.25 0 0,0 15,14.25A1.25,1.25 0 0,0 16.25,13A1.25,1.25 0 0,0 15,11.75M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12C3.97,11.71 3.97,11.43 4,11.14C6.38,10.1 8.27,8.17 9.26,5.77C11.13,8.42 14.17,10 17.42,10C18.18,10 18.93,9.91 19.67,9.74C20.92,14 18.5,18.43 14.26,19.67C13.5,19.89 12.76,20 12,20M0,2A2,2 0 0,1 2,0H6V2H2V6H0V2M24,22A2,2 0 0,1 22,24H18V22H22V18H24V22M2,24A2,2 0 0,1 0,22V18H2V22H6V24H2M22,0A2,2 0 0,1 24,2V6H22V2H18V0H22Z"/>
  </svg>
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
