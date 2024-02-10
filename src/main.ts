import { waitForElm } from "./utils";
import SearchFaces from "./SearchFaces.svelte";
import FindFaces from "./FindFaces.svelte";

stash.addEventListener("stash:page:scene", function () {
  let elms = ".ml-auto .btn-group";
  waitForElm(elms).then(() => {
    const e = document.querySelector(elms);
    if (!document.querySelector("#visage")) {
      new SearchFaces({ target: e });
    }
    if (!document.querySelector("#faces")) {
      const e = document.querySelector(elms);
      new FindFaces({ target: e });
    }
  });
});

stash.addEventListener("stash:page:image", function () {
  let elms = ".ml-auto .btn-group";
  waitForElm(elms).then(() => {
    if (!document.querySelector("#visage")) {
      const e = document.querySelector(elms);
      new SearchFaces({ target: e });
    }
  });
});
