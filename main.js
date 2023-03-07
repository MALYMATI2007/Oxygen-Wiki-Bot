const {app, BrowserWindow, Menu, ipcMain, MenuItem} = require('electron')
const fs = require("fs")
const { mwn } = require('mwn');
const path = require('path')
const {getTranslation} = require("./src/Translations.js")

const location = app.getLocaleCountryCode()

require('@electron/remote/main').initialize()

configPath = path.join(app.getPath("userData"), "config.json")
tempImageFile = path.join(app.getPath("temp"), "owb.png")
uploadPath = path.join(app.getPath("userData"), "upload/")

clearConfigFile = `{
    "dark_mode": false,
    "username":"",
    "password":"",
    "url":"",
    "url_nl":""
}
`

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, clearConfigFile, "utf8", err => {
        if (err) {
          console.log(getTranslation(location, "log_file_error"), err)
          app.quit();
        } else {
          console.log(getTranslation(location, "log_file_success"))
        }
      })
}

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath)
}

Config = JSON.parse(fs.readFileSync(configPath, 'utf8'))


let bot = new mwn({
    apiUrl: Config.url,
    username: Config.username,
    password: Config.password,
    silent: false,      // suppress messages (except error messages)
    retryPause: 1000,   // pause for 1000 milliseconds (1 second) on maxlag error.
    maxRetries: 5       // attempt to retry a failing requests upto 5 times
});

let botNl = new mwn({
    apiUrl: Config.url_nl,
    username: Config.username,
    password: Config.password
});

function createWindow () {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        enableLargerThanScreen: false,
        thickFrame: true,
        center: true,
        title: "Oxygen Wiki Bot",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: "src/icon.ico"
    })

    require('@electron/remote/main').enable(mainWindow.webContents)
    
    mainWindow.loadFile("src/index.html")

    menu = new Menu.buildFromTemplate(
        [
            {
                label: getTranslation(location, "menu_file"),
                submenu:[
                    {
                        label: getTranslation(location, "menu_file_quit"),
                        role: "close"
                    }
                ]
            },
            {
                label: getTranslation(location, "menu_view"),
                submenu: [
                    {
                        label: getTranslation(location, "menu_view_dark"),
                        type: "checkbox",
                        checked: JSON.parse(fs.readFileSync(configPath, 'utf8')).dark_mode,
                        click: e => {

                            data = JSON.parse(fs.readFileSync(configPath, 'utf8'))

                            data.dark_mode = e.checked

                            fs.writeFile(configPath, JSON.stringify(data, null, "\t"), "utf8", err => {
                                if (err) {
                                  console.log(getTranslation(location, "log_file_error"), err)
                                } else {
                                  console.log(getTranslation(location, "log_file_success"))
                                }
                            })

                            mainWindow.webContents.send("switch-theme", e.checked)
                        }
                    }
                ]
            },
            {
                label: getTranslation(location, "menu_config"),
                click() {
                    createConfigWindow()
                }
            }
        ]
    )

    if (app.commandLine.hasSwitch("debug")) { menu.append(new MenuItem({ label: "Debug", submenu: [{ label: "DevTools", click() { mainWindow.webContents.openDevTools() }}]}))}

    mainWindow.setMenu(menu)

    //mainWindow.webContents.openDevTools()

}

function createConfigWindow () {
    configWindow = new BrowserWindow({
        height: 256,
        width: 512,
        enableLargerThanScreen: false,
        resizable: false,
        minimizable: false,
        thickFrame: true,
        center: true,
        title: "Config",
        modal: true,
        parent: mainWindow,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: "src/icon.ico"
    })

    require('@electron/remote/main').enable(configWindow.webContents)

    configWindow.loadFile("src/config.html")

    configWindow.setMenu(null)

    configWindow.webContents.on('ready-to-show', () => { configWindow.show() })

    // configWindow.webContents.openDevTools()
}


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
})

ipcMain.on('submitConfig', (event, data) => {

    fs.writeFile(configPath, JSON.stringify(data, null, "\t"), "utf8", err => {
        if (err) {
          console.log(getTranslation(location, "log_file_error"), err)
        } else {
          console.log(getTranslation(location, "log_file_success"))

          configWindow.close()

          Config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

          bot.setOptions({
            apiUrl: Config.url,
            username: Config.username,
            password: Config.password
        });

        botNl.setOptions({
            apiUrl: Config.url_nl,
            username: Config.username,
            password: Config.password
        });

        }
      })
    
});

ipcMain.on("TransferImages", (event, list) => {

    (async () => {
        
        await botNl.getSiteInfo()
        
        for (const element of list) {
            await bot.login()
            await botNl.download(`File:${element}`, tempImageFile)
            await bot.upload(tempImageFile, `File:${element}`, " ", { ignorewarnings: true })
            await bot.logout()
        }
    })();

});

ipcMain.on("AddCategory", (event, data) => {
    
    list = data.list
    category = data.category

    console.log(JSON.stringify(list))
    console.log(category)

    (async () => {
        
        for (const element of list) {

            await bot.login()
            await bot.edit(element, (rev) => {

            let text = rev.content + `\n[[${category}]]`

            return {
                text: text,
                summary: "Added Category",
                minor: true,
                watchlist: "nochange"
            };
            })/*.then(() => {
                console.log("Promise Resolved");
            }).catch((err) => {
                console.log(`Promise Rejected`);
            })*/
            await bot.logout()
        
        }
    })();
});

ipcMain.on("TransferImages", (event, list) => {

    (async () => {

        list = fs.readdirSync(uploadPath)
        
        for (const element of list) {
            await bot.login()
            await bot.upload(path.join(uploadPath, element), `File:${element}`, " ", { ignorewarnings: true })
            await bot.logout()
        }
    })();

});