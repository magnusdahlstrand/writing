const electron = require('electron')
const {app, BrowserWindow} = electron;

const IS_DEV = process.env.ELECTRON_ENV === 'dev';

const path = require('path')
const url = require('url')

var defaultWindowOpts = {
	width: 1440,
	height: 820,
	frame: false,
	center: true,
	title: 'writing',
	titleBarStyle: 'hidden-inset',
	acceptFirstMouse: true,
	hasShadow: true,
	webPreferences: {
		experimentalFeatures: true
	}
}

var devWindowOpts = {
	width: 1200,
	center: false,
	y: 100,
	x: 10,
}

function createWindow(name, opts={}) {
	var win = new BrowserWindow(
		Object.assign(
			{},
			defaultWindowOpts, //default window opts
			IS_DEV ? devWindowOpts : {}, //override with dev opts if dev
			opts //window specific opts
		)
	);

	win.loadURL(url.format({
		pathname: path.join(__dirname, `${name}.html`),
		protocol: 'file:',
		slashes: true
	}))

	// Open the DevTools.
	if(IS_DEV) {
		win.webContents.openDevTools()
	}
	return win;
}

function init() {
	createWindow('index');
	app.on('window-all-closed', () => {
		// all windows closed, do nothing
	})
}

function main() {
	if(app.isReady()) {
		init();
	}
	else {
		app.on('ready', init);
	}
}

if(require.main === module) {
	main();
}

module.exports = main;
