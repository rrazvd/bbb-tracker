import { API_PATH } from "./config.js";

chrome.runtime.onInstalled.addListener(() => {
  setInterval(() => {
    followParticipant();
  }, 15000);
});

export function followParticipant() {
  chrome.storage.sync.get("participant", ({participant}) => {
      if (participant) {
        console.log("Tracking participant: " + participant + "...");
        fetch(API_PATH + "/cams/labels/" + participant, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((data) => {        
            if (data) {
              let cam = undefined;            
              if (data?.cams?.length > 0) {
                cam = data.cams[0];
              } else if (data?.prev_cams?.length > 0) {
                cam = data.prev_cams[0];
              }

              if (cam) {
                console.log("Participant tracked: " + participant + " on " + cam["location"] + " " +cam["name"]);
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentUrl = tabs[0]?.url;
                    if (currentUrl?.includes("globoplay.globo.com/bbb")) {
                      if (currentUrl !== cam["stream_link"]) {
                        chrome.tabs.update({ url: cam["stream_link"] });
                      }
                    } else console.log("User is not in payperview tab!");
                  }
                );
              }
            }
          });
      } else console.log("User hasn't defined a participant to be tracked");
    }
  );
}
