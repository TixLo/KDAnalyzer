// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')

var menu = Menu.buildFromTemplate([
    {
        label: 'Menu',
        submenu: [
            {
              label:'Exit',
              click() {
                app.exit();
              }
            }
        ]
    }
])

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({width: 1200, height: 800 })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.setTitle("KDAnalyzer")
}

app.on('ready', () => {
    // Menu.setApplicationMenu(menu)
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit();
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
