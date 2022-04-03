// ==UserScript==
// @name         Transgender Flag Template
// @namespace    https://lunar.exchange/
// @version      0.1
// @description  Try to take over the canvas!
// @author       SaphireLattice - this script, oralekin - original script, Ender#5769 - image
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @downloadURL  https://raw.githubusercontent.com/SaphireLattice/rPlaceOverlay/master/overlayScript.user.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==
if (window.top !== window.self) {
    window.addEventListener('load', async () => {
        const repoRoot = "https://raw.githubusercontent.com/SaphireLattice/rPlaceOverlay/master/";
        async function get(url, parseJson = true, headers = {}) {
            return new Promise((resolve, reject) => {
                let xhr = GM_xmlhttpRequest({
                    method: "GET",
                    url,
                    onload: (r) => resolve(parseJson ? JSON.parse(r.response) : r.response),
                    onerror: (e) => reject(e),
                    headers: headers ?? parseJson ? {
                        "Accept": "application/json"
                    } : {}
                });
            });
        }
        function makeOverlay(src, x = 0, y = 0, w = 2000, h = 1000) {
            const imgElem = document.createElement("img");
            imgElem.src = src;
            imgElem.style = `position: absolute;left: ${x};top: ${y};image-rendering: pixelated;width: ${w}px;height: ${h}px;`;
            return imgElem;
        }

        const overlaysContainer = document.createElement("div");
        overlaysContainer.style = "position: absolute; left: 0; top: 0;";
        window.onkeyup = function(e) { if (e.key === 'h') overlaysContainer.style.display = 'block'; }
        window.onkeydown = function(e) { if (e.key === 'h') overlaysContainer.style.display = 'none'; }

        const data = await get(repoRoot + "overlays.json");

        const knownOverlays = data.overlays.map(
            meta => {
                return {
                    meta,
                    elem: makeOverlay(meta.url, meta.posX, meta.posY, meta.width, meta.height)
                }
            }
        );
        console.log("Trans rights!", knownOverlays);

        knownOverlays.forEach(o => overlaysContainer.appendChild(o.elem));

        const placeRoot = document.getElementsByTagName("mona-lisa-embed")[0].shadowRoot;

        placeRoot.children[0].getElementsByTagName("mona-lisa-canvas")[0].shadowRoot.children[0].appendChild(overlaysContainer);

        placeRoot.querySelector(".bottom-controls").appendChild(
            (() => {
                const t = document.createElement("div");
                t.style = "height: 24px;display: flex;justify-content: center;align-items: center;background-color: #fff;color: #000;border-radius: 26px;font-size: 14px;font-weight: 700;line-height: 17px;box-shadow: 0 4px 10px rgba(0,0,0,.25);font-family: var(--mona-lisa-font-sans);padding: 0 2em;pointer-events: auto;cursor: pointer;";
                t.innerText = "Toggle overlay"
                t.addEventListener("click", () => {
                    overlaysContainer.style.display = overlaysContainer.style.display == "none" ? "block" : "none";
                })
                return t;
            })()
        )

        console.log("Init finished, see ya!");
    }, false);
}
