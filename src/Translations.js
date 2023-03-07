const fs = require("fs")

module.exports = { getTranslation, getLangName, getTranslationAuthor }

function getTranslation(Code, TranslationKey) {
    const filePath = "langs/" + Code.toLowerCase() + ".json"


    if (!fs.existsSync(filePath) && Code.toLowerCase() != "en_us") {

        return getTranslation("en_us", TranslationKey)

    }else if (!fs.existsSync(filePath) && Code.toLowerCase() == "en_us") {

        return "Translation ERROR"

    }

    const rawData = fs.readFileSync(filePath, 'utf8')

    if (TranslationKey in JSON.parse(rawData)) {
        return JSON.parse(rawData)[TranslationKey]
    } else {
        if (!Code.toLowerCase() == "en_us") {
            return getTranslation("en_us", TranslationKey)
        }else {
            return "Translation ERROR"
        }
    }
}

function getLangName(Code) {
    const filePath = "langs/" + Code.toLowerCase() + ".json"
    if (!fs.existsSync(filePath)) {
        return "Translation ERROR"
    }

    const rawData = fs.readFileSync(filePath, 'utf8')

    if ("LanguageName" in JSON.parse(rawData)) {
        return JSON.parse(rawData).LanguageName
    } else {
        return "Please Add Language Name in Translation"
    }

}

function getTranslationAuthor(Code) {
    const filePath = "langs/" + Code.toLowerCase() + ".json"

    if (!fs.existsSync(filePath)) {
        return "Translation ERROR"
    }

    const rawData = fs.readFileSync(filePath, 'utf8')

    if ("TranslationAuthor" in JSON.parse(rawData)) {
        return JSON.parse(rawData).TranslationAuthor
    } else {
        return "Unknow Author"
    }


}