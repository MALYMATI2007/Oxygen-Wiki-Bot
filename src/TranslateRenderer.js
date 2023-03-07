class TranslatedText extends HTMLElement {
    connectedCallback() {
        const { app } = require('@electron/remote')
        const { getTranslation } = require("./Translations.js")

        if (!this.getAttribute("key")) {
            this.innerHTML = "Enter Key"
        } else {
            this.innerHTML = getTranslation(app.getLocaleCountryCode(), this.getAttribute("key"))
        }
    }
  }
customElements.define("translated-text", TranslatedText);