const {ipcRenderer} = require('electron')
const fs = require('fs')
const {addClass, removeClass} = require('./util.js')

function loadFunc() {
const rawData = fs.readFileSync('./config.json', 'utf8')
const data = JSON.parse(rawData)
if (data.dark_mode) addClass(document.getElementsByTagName("body")[0], "dark")
}

function transfer() {

    var textarea = document.getElementById('TransferInput');
    rawList = textarea.value
    list = rawList.split("\n")

    ipcRenderer.send('TransferImages', list)

}

function addCategory() {

    var textarea = document.getElementById('CategorysationInput');
    rawList = textarea.value
    list = rawList.split("\n")

    var input = document.getElementById('CategoryInput');
    category = input.value

    ipcRenderer.send('AddCategory', { list: list, category: category })
}

ipcRenderer.on("switch-theme", (event, arg) => {
    arg ? addClass(document.getElementsByTagName("body")[0], "dark") : removeClass(document.getElementsByTagName("body")[0], "dark")
})
