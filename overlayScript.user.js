// ==UserScript==
// @name         Transgender Flag Template
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Try to take over the canvas!
// @author       SaphireLattice - this script, oralekin - original script, Ender#5769 - image
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @downloadURL  https://raw.githubusercontent.com/SaphireLattice/rPlaceOverlay/master/overlayScript.user.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

async function get(url, parseJson = true, headers = {}) {
    return new Promise((resolve, reject) => {
        let xhr = GM_xmlhttpRequest({
            method: "GET",
            url,
            onload: (r) => resolve(parseJson ? JSON.parse(r.response) : r.response),
            onerror: (e) => reject(e),
            headers:
                headers ?? parseJson
                    ? {
                          Accept: "application/json",
                      }
                    : {},
        });
    });
}

class PlaceOverlay {
    scriptVersion = "0.4";
    repoRoot = "https://raw.githubusercontent.com/SaphireLattice/rPlaceOverlay/master/";

    enabled = true;

    overlays = [];

    overlayCanvas = document.createElement("canvas");
    overlaysContainer = document.createElement("div");
    toggleButton = document.createElement("div");
    modalContainer = document.createElement("div");
    modalMain = document.createElement("div");

    offscreenCanvas = document.createElement("canvas");

    placeRoot = null;

    tempToggle = false;

    constructor() {
        window.addEventListener("load", () => this.init());
    }

    async init() {
        console.log("Trans rights!", this);
        this.domInit();
        await this.updateOverlays();
    }

    updateButton() {
        if (this.enabled) {
            this.overlaysContainer.style.display = "block";
            this.toggleButton.innerText = "🟢 | Disable overlay";
        } else {
            this.overlaysContainer.style.display = "none";
            this.toggleButton.innerText = "🔴 | Enable overlay ";
        }
    }

    toggle(forceTo = null) {
        this.enabled = forceTo == null ? !this.enabled : !!forceTo;
        this.updateButton();
    }

    async updateOverlays() {
        this.overlays.forEach((o) => o.elem.remove());

        const data = await get(this.repoRoot + `overlays.json?cachebust=${new Date().getTime()}`);

        if (data.scriptVersion != this.scriptVersion) {
            console.log(`Version mismatch, got "${data.scriptVersion}", expected "${this.scriptVersion}"`);
            this.modalMain.innerText =
                "Your template script is out of date! Reload the page or update the script";
            this.modalContainer.style.display = "flex";
        }

        this.overlays = data.overlays.map((meta) => {
            console.log(`Adding "${meta.name}" from ${meta.url}`)
            return {
                meta,
                elem: this.makeOverlayImage(
                    meta.url,
                    meta.posX,
                    meta.posY,
                    meta.width ?? -1,
                    meta.height ?? -1,
                    meta.scale ?? 3
                ),
            };
        });

        this.overlays.forEach((o) => this.overlaysContainer.appendChild(o.elem));
    }

    domInit() {
        this.placeRoot = document.getElementsByTagName("mona-lisa-embed")[0].shadowRoot;

        this.setStyles();

        // when a key is being held down, we get multiple onkeydown events, so we need to track that
        window.addEventListener("keydown", (event) => {
            if (event.key === "h" && !this.tempToggle) {
                this.tempToggle = true;
                this.toggle();
            }
        });
        window.addEventListener("keyup", (event) => {
            if (event.key === "h" && this.tempToggle) {
                this.tempToggle = false;
                this.toggle();
            }
        });
        this.toggleButton.addEventListener("click", () => this.toggle());

        this.modalContainer.appendChild(this.modalMain);
        document.querySelector("body").appendChild(this.modalContainer);

        this.placeRoot.children[0]
            .getElementsByTagName("mona-lisa-canvas")[0]
            .shadowRoot.children[0].appendChild(this.overlaysContainer);

        this.updateButton();
        this.placeRoot.querySelector(".bottom-controls").appendChild(this.toggleButton);
    }

    setStyles() {
        this.toggleButton.style = `height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff;
            color: #000;
            border-radius: 26px;
            font-size: 14px;
            font-weight: 700;
            line-height: 17px;
            box-shadow: 0 4px 10px rgba(0,0,0,.25);
            font-family: var(--mona-lisa-font-sans);
            padding: 0 2em;
            pointer-events: auto;
            cursor: pointer;`;

        this.modalContainer.style = `position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            pointer-events: none;
            align-items: center;
            justify-content: center;
            display: none;`;

        this.modalMain.style = `min-height: 24px;
            min-width: 100px;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            background-color: rgb(255, 255, 255);
            color: rgb(0, 0, 0);
            border-radius: 26px;
            font-size: 14px;
            line-height: 17px;
            box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 10px;
            font-family: var(--mona-lisa-font-sans);
            padding: 1em 2em;
            pointer-events: auto;`;
    }

    makeOverlayImage(src, x = 0, y = 0, w = 2000, h = 1000, scale = 3) {
        const imgElem = document.createElement("img");
        if (src.includes("https://")) {
            const hasQuery = src.includes("?");
            const endsAnd = src.endsWith("&");

            src = `${src}${hasQuery ? (endsAnd ? "" : "&") : "?"}cachebust=${new Date().getTime()}`;
        }
        imgElem.src = src;
        imgElem.addEventListener("load", () => {
            console.log(src, imgElem.width, imgElem.height);
            if (w == -1) w = imgElem.width / scale;
            if (h == -1) h = imgElem.height / scale;
            imgElem.style = `position: absolute;
                left: ${x};
                top: ${y};
                image-rendering: pixelated;
                width: ${w}px;
                height: ${h}px;`;
        });
        return imgElem;
    }
}

if (window.top !== window.self) {
    new PlaceOverlay();
}
