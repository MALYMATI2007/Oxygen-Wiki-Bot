const {ipcRenderer} = require('electron')
const fs = require('fs')
const {addClass} = require('./util.js')
const { app } = require('@electron/remote')
const path = require('path')

configPath = path.join(app.getPath("userData"), 'config.json')

function loadFunc() {

const rawData = fs.readFileSync(configPath, 'utf8')
const data = JSON.parse(rawData)

if (data.dark_mode) addClass(document.getElementsByTagName("body")[0], "dark")

document.getElementById("username").value = data.username
document.getElementById("password").value = data.password
document.getElementById("url").value = data.url
document.getElementById("url_nl").value = data.url_nl

}


function myFunc() {

    const rawData = fs.readFileSync(configPath, 'utf8')
    const data = JSON.parse(rawData)

    formData = new FormData(ConfigForm);

    ipcRenderer.send('submitConfig', {
        dark_mode: data.dark_mode,
        username: formData.get("username"),
        password: formData.get("password"),
        url: formData.get("url"),
        url_nl: formData.get("url_nl")
    } )

}