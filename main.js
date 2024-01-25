import 'cropperjs/dist/cropper.css'
import './src/scss/main.scss'

import clickSound from '/cl.wav'
import winSound from '/winSound.wav'

import { Counter } from './src/js/counter.js'
import Cropper from 'cropperjs'
import MicroModal from 'micromodal'
import * as localStore from '@zellwk/javascript/browser/localstore.js'
import { Puzzle } from './src/js/puzzle.js'
import { bodyHeight, bodyWidth, log, getElSizes } from './src/js/utils'

import { opened } from './src/js/menu-alt'
import getThemes from './src/js/themes'
import { dict } from './src/js/langs'
import { isMobile } from 'mobile-device-detect'
// navbar-header__mobile

const themes = getThemes()
function winObj() {
	window.Pg = {
		counter: new Counter(document.getElementById('counter'), { template: 'h:m:s' }),
		toggle: document.querySelector('#control button[data-action="toggle"]'),
		toggleMobile: document.querySelector('.navbar-header__mobile button[data-action="toggle"]'),
		stopMobile: document.querySelector('.navbar-header__mobile button[data-action="stop"]'),
		stop: document.querySelector('#control button[data-action="stop"]'),
		mask: '<div class="backdrop" id="mask"></div>',
		status: null,
		theme: themes[settings.theme],
		menuOpened: false,
		click: new Audio(),
		win: new Audio()
	}
	Pg.click.src = clickSound
	Pg.win.src = winSound
}

let settings

let SVG_XLINK = "http://www.w3.org/1999/xlink"
theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#play')

// let click = new Audio(), win = new Audio()
// click.src = clickSound
// win.src = winSound

let cropper, game
let boardWidth, boardHeight;


// statuses:
const CREATED = 'CREATED'
const IMAGELOADED = 'IMAGELOADED'
const IMAGECROPPED = 'IMAGECROPPED'
const GAMESTARTED = 'GAMESTARTED'
const GAMERUN = 'GAMERUN'
const GAMEPAUSED = 'GAMEPAUSED'
const GAMEFINISHED = 'GAMEFINISHED'
// 0 - created
// 1 - image loaded
// 2 - image cropped
// 3 - game started
// 4 - game paused
// 5 - game finished



function loadImage() {
	// log('loaded')
	// load the uploaded image
	let fileInput = document.getElementById("fileInput");
	let file = fileInput.files[0];
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function () {
		// let img = new Image();
		let img = document.getElementById('image-src');
		img.src = reader.result;
		img.onload = function () {
			showCropArea()
			hideLoader()
			cropper = new Cropper(img, {
				dragMode: 'move',
				aspectRatio: Pg.ratio,
				autoCropArea: .9,
				restore: false,
				guides: false,
				center: false,
				highlight: false,
				cropBoxMovable: false,
				cropBoxResizable: false,
				toggleDragModeOnDblclick: false,
			})
			Pg.status = IMAGELOADED
			handler()
		}
	}
}

function start() {
	game.start()
	Pg.counter.run()
}

function hideMask() {
	document.querySelector('#mask').remove()
}
function showMask() {
	document.querySelector('#playBox').insertAdjacentHTML('beforeend', Pg.mask)
}

function hideLoader() {
	document.getElementById('imgLoader').style.display = 'none'
}

function showLoader() {
	document.getElementById('imgLoader').style.display = ''
}

function showCropArea() {
	document.querySelector('.image-area').style.zIndex = '5'
}

function getColor(i) {
	let prefix = '#'
	const dashboardColors = window.Pg.theme.partsColor
	return prefix + dashboardColors[i]
}


function initPlaybox(options) {
	// counter/header height 85
	// footer height 40
	let safeHeight = 40 + 85
	const board = document.getElementById('playBox')
	if (isMobile) {

		safeHeight += 120
	} else {
		safeHeight += 30
	}

	const uploadBox = document.getElementById('imgLoader')
	let requiredHeight = bodyHeight - safeHeight
	let requiredWidth = 600
	if (bodyWidth <= 600) {
		requiredWidth = bodyWidth - 32
	}

	const item = {
		height: Math.floor(requiredHeight / options.gridY),
		width: Math.floor(requiredWidth / options.gridX)
	}

	for (let i = 0; i < options.gridX * options.gridY; i++) {
		let el = document.createElement('div')
		let inner = document.createElement('div')
		inner.classList.add('inner')
		el.append(inner)

		el.classList.add('item')
		let dummy = document.createElement('div')
		dummy.classList.add('fill')
		dummy.style.background = getColor(i)
		inner.appendChild(dummy)
		el.style.width = item.width + 'px'
		el.style.height = item.height + 'px'
		board.append(el)
	}

	board.append(uploadBox)
	// item border 3px
	boardWidth = (item.width + 6) * options.gridX
	boardHeight = (item.height + 6) * options.gridY

	Pg.w = boardWidth
	Pg.h = boardHeight
	Pg.item = item
	Pg.ratio = boardWidth / boardHeight
	board.style.width = boardWidth + 'px'

	Pg.status = CREATED
	showLoader()
}
/**
 * user
 * users pictures
 * current picture
 * timer
 * step 
 *  
*/

function navbar() {
	document.querySelector('.menu-items').style.display = ''
	document.getElementById('navbar-trigger').addEventListener('click', (evt) => {
		document.querySelector('.navbar').classList.toggle('is-open')

		Pg.menuOpened = !Pg.menuOpened
	})
}

function initMenus(options) {
	const menuIds = ['level', 'lang', 'theme'];
	menuIds.forEach(menuId => {
		let menuEl = document.getElementById(menuId)
		let items = menuEl.querySelectorAll('.sub-menu-link')
		Array.from(items).forEach(item => {
			let selected = options[menuId]
			if (item.dataset.target === selected) {
				item.classList.add('selected')
			}
		})
	})
}
function initSound(settings) {
	const soundFull = document.querySelector('.sound-full')
	const soundMute = document.querySelector('.sound-mute')
	if (settings.soundMuted) {
		Pg.click.muted = true
		Pg.win.muted = true
		soundFull.style.display = 'none'
		soundMute.style.display = ''
	} else {
		soundFull.style.display = ''
		soundMute.style.display = 'none'
		Pg.click.muted = false
		Pg.win.muted = false
	}
}



function onCrop(options) {
	let canvas = cropper.getCroppedCanvas({
		maxWidth: boardWidth,
		width: boardWidth,
		minWidth: boardWidth,
	});

	// document.querySelector('.image-area img').style.display = 'none'
	document.querySelector('.image-area').style.display = 'none'
	canvas.toBlob((blob) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = function () {

			const image = new Image()
			image.src = reader.result
			cropper.destroy();
			cropper = null;
			image.onload = function () {
				Pg.image = {
					w: image.width,
					h: image.height
				}
				game = new Puzzle(image, options.gridX, options.gridY, 3, Pg.click)
				Pg.game = game
				game.init()
				Pg.status = GAMESTARTED
			}
		};
	}, 'image/jpeg');

}

function applyLang(lang) {
	const dictionary = dict[settings.lang]
	//menu links
	const links = document.querySelectorAll('a')
	Array.from(links).forEach(link => {
		let key = link.dataset?.lang ?? ''
		if (key) {
			link.innerText = dictionary[key]
		}
	})
	// headings h2
	const headings = document.querySelectorAll('h2')
	Array.from(headings).forEach(el => {
		let key = el.dataset?.lang ?? ''
		if (key) {
			el.innerText = dictionary[key]
		}
	})
	document.title = dictionary.title
	document.documentElement.setAttribute('lang', settings.lang);
	const logoMobile = document.querySelector('.navbar-header__mobile svg.full-logo')
	const logoKey = '.full-logo-' + lang
	const preLogoMobile = document.querySelector(logoKey)
	logoMobile.innerHTML = ''
	logoMobile.innerHTML = preLogoMobile.innerHTML
}


function saveSettings() {
	localStore.set('settings', settings)
}

function init(bool) {
	const defaults = {
		level: '3x4',
		theme: 'green',
		gridX: 3,
		gridY: 4,
		lang: 'en',
		soundMuted: false,
	}
	const savedSettings = localStore.get('settings')
	if (savedSettings) {
		settings = savedSettings
	} else {
		settings = defaults
	}
	setTheme(settings.theme)
	winObj()
	navbar()
	applyLang(settings.lang)
	initMenus(settings)
	eventFiller()
	initPlaybox(settings)
	handler()
	MicroModal.init({
		openTrigger: 'data-custom-open',
	});

	initSound(settings)
	// initSubMenu()
	saveSettings()
}

function showMobileControl() {
	Pg.toggleMobile.style.display = ''
	Pg.stopMobile.style.display = ''
	document.querySelector('.o-full-play').style.display = 'none'
	document.querySelector('.o-full-close').style.display = 'none'
}


function handler(action) {
	// log('action: ', action)
	// log('status: ', Pg.status)
	switch (Pg.status) {
		case (CREATED):
			// let btns = document.querySelectorAll('#control button')
			// Array.from(btns).forEach(btn => btn.style.display = 'none')
			break;

		case (IMAGELOADED):
			Pg.toggle.style.display = ''

			Pg.status = IMAGECROPPED
			// show play/pause button
			let middleBtn = document.getElementById('desktop-control')
			middleBtn.style.display = ''
			showMobileControl()
			break;
		case (IMAGECROPPED):
			(action === 'toggle') && onCrop(settings)


			break;
		case (GAMESTARTED):
			if (action === 'toggle') {
				start()
				theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#pause')
				playPauseM.setAttributeNS(SVG_XLINK, 'xlink:href', '#pauseMobile')
				Pg.stop.style.display = ''
				Pg.stopMobile.style.display = ''
				Pg.status = GAMEPAUSED
			}
			break;
		case (GAMEPAUSED):
			if (action === 'toggle') {
				console.log('here')
				theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#play')
				playPauseM.setAttributeNS(SVG_XLINK, 'xlink:href', '#playMobile')
				Pg.counter.stop()
				showMask()
				Pg.status = GAMERUN
			}
			break;
		case (GAMERUN):
			if (action === 'toggle') {

				theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#pause')
				playPauseM.setAttributeNS(SVG_XLINK, 'xlink:href', '#pauseMobile')
				Pg.counter.run()
				hideMask()
				Pg.status = GAMEPAUSED
			}
			break;
		case (GAMEFINISHED):
			break;

	}
}

function solved() {
	Pg.counter.stop()
	theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#play')
	Pg.win.play()
	Pg.status = GAMEFINISHED
}

function applyGrid(gridX, gridY) {
	settings.gridX = gridX
	settings.gridY = gridY
	settings.level = gridX + 'x' + gridY
	saveSettings()
	window.location.reload()
}

function applyTheme(theme) {
	settings.theme = theme
	saveSettings()

	window.location.reload()
}

function setTheme(theme) {
	const activeTheme = themes[theme]
	const r = document.querySelector(':root');

	r.style.setProperty("--theme-frame1-color", `#${activeTheme.border1}`);
	r.style.setProperty("--theme-frame2-color", `#${activeTheme.border2}`);
	r.style.setProperty("--theme-frame3-color", `#${activeTheme.border3}`);

	r.style.setProperty("--theme-btn-out-start", `#${activeTheme.btn.outerColorStart}`);
	r.style.setProperty("--theme-btn-out-end", `#${activeTheme.btn.outerColorEnd}`);
	r.style.setProperty("--theme-btn-in-start", `#${activeTheme.btn.innerColorStart}`);
	r.style.setProperty("--theme-btn-in-end", `#${activeTheme.btn.innerColorEnd}`);

	r.style.setProperty("--theme-btn-border", `#${activeTheme.btn.border}`);
	r.style.setProperty("--theme-btn-icon", `#${activeTheme.btn.icon}`);
}

function resetGame() {
	game = null
	Pg.status = null
	Pg.toggle.style.display = 'none'
	document.getElementById('imgLoader').style.display = ''
	const imageArea = document.querySelector('.image-area')
	imageArea.innerHTML = ''
	imageArea.insertAdjacentHTML('afterbegin', '<img src="" id="image-src" />')
	const items = document.querySelectorAll('.item')
	Array.from(items).forEach(item => item.remove())
}

function menuHandler(evt) {

	evt.preventDefault();
	const action = evt.target.dataset?.target ?? ''
	log(action)
	switch (action) {
		case 'open':
			document.getElementById('fileInput').click()
			break;
		case 'continue':
			break;
		case 'share':
			break;
		case 'toggle-timer':
			document.querySelector('#counter').classList.toggle('v-hidden')
			break;
		case 'save':
			break;
		case 'ru':
			settings.lang = 'ru'
			saveSettings()
			window.location.reload()
			break;
		case 'en':
			settings.lang = 'en'
			saveSettings()
			window.location.reload()
			break;
		case '3x2':
			applyGrid(3, 2)
			break;
		case '3x3':
			applyGrid(3, 3)
			break;
		case '3x4':
			applyGrid(3, 4)
			break;
		case 'red':
			applyTheme('red')
			break;
		case 'blue':
			applyTheme('blue')
			break;
		case 'green':
			applyTheme('green')
			break;
		case 'violet':
			applyTheme('violet')
			break;
		case 'loaded':
			// hide header mobile letters
			// show header mobile buttons

			break;
	}
}

function control(evt) {
	let evtEl = evt.target
	// console.log(evtEl)
	let el = (evtEl).closest('button.btn')
	if (el && el.dataset && el.dataset.action !== '') {
		let action = el.dataset.action
		handler(action)
	}
}

function eventFiller() {
	const listener = document.getElementById('control')
	listener.addEventListener('click', (evt) => {
		control(evt)
	})
	document.getElementById('fileInput').addEventListener('change', loadImage)
	document.getElementById('playBox').addEventListener('solved', () => {
		solved()
	})

	document.querySelector('.sound-control').addEventListener('click', function (evt) {
		evt.preventDefault()
		const soundFull = this.querySelector('.sound-full')
		const soundMute = this.querySelector('.sound-mute')
		if (Pg.click.muted) {
			Pg.click.muted = false
			Pg.win.muted = false
			soundFull.style.display = ''
			soundMute.style.display = 'none'
			settings.soundMuted = false

		} else {
			Pg.click.muted = true
			Pg.win.muted = true
			soundFull.style.display = 'none'
			soundMute.style.display = ''
			settings.soundMuted = true
		}
		saveSettings()
	})


	// menu
	document.getElementById('app-menu').addEventListener('click', menuHandler)
	document.addEventListener('click', (evt) => {
		let el = evt.target
		let trigger = el.closest('#navbar-trigger') ? true : el.closest('#app-menu') ? true : false
		if (Pg.menuOpened && !trigger) {
			document.querySelector('.navbar').classList.toggle('is-open')
			Pg.menuOpened = !Pg.menuOpened
		}
	})


}

window.addEventListener('load', init)


