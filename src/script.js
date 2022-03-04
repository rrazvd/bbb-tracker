import { API_PATH } from "./config.js";
import { followParticipant } from "./background.js";

const participantsNames = {
  arthur: "Arthur Aguiar",
  douglas: "Douglas Silva",
  eliezer: "Eliezer Carmo",
  eslo: "Eslovênia Marques",
  gustavo: "Gustavo Marsengo",
  jade: "Jade Picon",
  jessi: "Jessilane Alves",
  lais: "Laís Caldas",
  lari: "Larissa Tomasia",
  linna: "Linn da Quebrada",
  lucas: "Lucas Bissoli",
  naty: "Natália Deodato",
  paulo: "Paulo André",
  scooby: "Pedro Scooby",
  vini: "Vinicius Sousa",
};

function handleOnClickParticipant() {
  chrome.storage.sync.get("participant", ({ participant }) => {
    if (participant === this.id) {
      this.checked = false;
      chrome.storage.sync.clear();
    } else {
      chrome.storage.sync.set({ participant: this.id });
      followParticipant();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const msgError = document.getElementById("error");
  const msgLoading = document.getElementById("loading");
  const cta = document.getElementById("cta");
  const form = document.getElementById("form");

  fetch(API_PATH + "/labels", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      /* hide messages */
      msgError.style.display = "none";
      msgLoading.style.display = "none";

      /* fill form group with participants options*/
      data.forEach((participant) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");

        radio.setAttribute("type", "radio");
        radio.setAttribute("name", "participant");
        radio.setAttribute("id", participant);
        radio.style.marginRight = "5px";
        radio.onclick = handleOnClickParticipant;

        label.setAttribute("for", participant);
        label.textContent = participantsNames[participant] ?? participant;

        const option = document.createElement("div");
        option.style.cssText = "display: flex; padding: 5px;";
        option.appendChild(radio);
        option.appendChild(label);
        form.appendChild(option);
      });

      /* show cta */
      cta.style.display = "flex";

      /* check if already exists a subscribed participant */
      chrome.storage.sync.get("participant", ({ participant }) => {
        if (participant) {
          const radio = document.getElementById(participant);
          radio.checked = true;
        }
      });
    })
    .catch((error) => {
      msgLoading.style.display = "none";
      cta.style.display = "none";
      msgError.style.display = "flex";
      console.log(error);
    });
});
