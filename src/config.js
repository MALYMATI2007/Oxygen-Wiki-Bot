const {ipcRenderer} = require('electron')
const fs = require('fs')
const {addClass} = require('./util.js')

function loadFunc() {

const rawData = fs.readFileSync('./config.json', 'utf8')

const data = JSON.parse(rawData)

if (data.dark_mode) addClass(document.getElementsByTagName("body")[0], "dark")

document.getElementById("username").value = data.username
document.getElementById("password").value = data.password
document.getElementById("url").value = data.url
document.getElementById("url_en").value = data.url_en

}


function myFunc() {

    formData = new FormData(ConfigForm);

    ipcRenderer.send('submitConfig', {
        username: formData.get("username"),
        password: formData.get("password"),
        url: formData.get("url"),
        url_en: formData.get("url_en")
    } )

}