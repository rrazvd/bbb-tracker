const API_PATH = config.API_PATH;

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
  chrome.storage.sync.set({ subscribedParticipant: this.id });
  followParticipant();
}

setInterval(() => {
  followParticipant();
}, 15000);

function followParticipant() {
  chrome.storage.sync.get(
    "subscribedParticipant",
    function ({ subscribedParticipant: participant }) {
      if (participant) {
        fetch(API_PATH + "/cams/labels/" + participant, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((data) => {
            if (data) {
              let link = undefined;

              if (data?.cams?.length > 0) {
                const cam = data.cams[0];
                link = cam["stream_link"];
              } else if (data?.prev_cams?.length > 0) {
                const prev_cam = data.prev_cams[0];
                link = prev_cam["stream_link"];
              }

              if (link) {
                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  (tabs) => {
                    let url = tabs[0].url;
                    if (url !== link) chrome.tabs.update({ url: link });
                  }
                );
              }
            }
          });
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const msgError = document.getElementById("error");
  const msgLoading = document.getElementById("loading");
  const cta = document.getElementById("cta");
  participants = document.getElementById("participants");

  fetch(API_PATH + "/labels", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      /* hide messages */
      msgError.style.display = "none";
      msgLoading.style.display = "none";

      const frag = document.createDocumentFragment();

      /* create radio form group with participants*/
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

        frag.appendChild(option);
      });
      cta.style.display = "flex";
      participants.appendChild(frag);

      /* check if already exists a subscribed participant */
      chrome.storage.sync.get(
        "subscribedParticipant",
        function ({ subscribedParticipant: participant }) {
          if (participant) {
            radio = document.getElementById(participant);
            radio.checked = true;
          }
        }
      );
    })
    .catch((error) => {
      msgLoading.style.display = "none";
      cta.style.display = "none";
      msgError.style.display = "flex";
    });
});
