// import 'normalize-scss'
import 'cropperjs/dist/cropper.css'
import './src/scss/main.scss'

import { Counter } from './src/js/counter.js'
import Cropper from 'cropperjs'
// import * as localStore from '@zellwk/javascript/browser/local-store.js'
import { Puzzle } from './src/js/puzzle.js'
import { bodyHeight, bodyWidth, log, getElSizes } from './src/js/utils'
window.Pg = {
	counter: new Counter(document.getElementById('counter'), { template: 'h:m:s' }),
	toggle: document.querySelector('#control button[data-action="toggle"]'),
	stop: document.querySelector('#control button[data-action="stop"]'),
	status: null,

}
let SVG_XLINK = "http://www.w3.org/1999/xlink"
theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#play')

let cropper, cropRatio = .8;
let game;
let boardWidth, boardHeight;
let gridX = 3, gridY = 3
// status:
// 0 - created
// 1 - image loaded
// 2 - image cropped
// 3 - game started
// 4 - game paused


function loadImage() {
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
			hideLoader()
			// console.log('boardHeight ', boardHeight)
			// console.log('boardWidth ', boardWidth)
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
				// ready: function () {
				// 	cropper.setCropBoxData({
				// 		width: boardWidth * cropRatio ,
				// 		height: boardHeight * cropRatio ,
				// 	})
				// }
			})
			Pg.status = 1
			handler()
		}
	}
}

function start() {
	game.start()
	Pg.counter.run()
}

function hideLoader() {
	document.getElementById('imgLoader').style.display = 'none'
}

function initPlaybox() {
	// counter/header height 32
	// footer height 40

	const safeHeight = 40 + 32 + 80
	// aspectRatio = gridX / gridY
	const board = document.getElementById('playBox')
	let requiredHeight = bodyHeight - safeHeight
	let requiredWidth = 600
	if (bodyWidth <= 600) {
		requiredWidth = bodyWidth - 32
	}
	// console.log(bodyHeight)
	// console.log(bodyWidth)
	const item = {
		height: Math.floor(requiredHeight / gridY),
		width: Math.floor(requiredWidth / gridX)
	}

	for (let i = 0; i < gridX * gridY; i++) {
		let el = document.createElement('div')
		el.classList.add('item')
		el.style.width = item.width + 'px'
		el.style.height = item.height + 'px'
		board.append(el)
	}
	boardWidth = (item.width + 2) * gridX
	boardHeight = (item.height + 2) * gridY

	Pg.w = boardWidth
	Pg.h = boardHeight
	Pg.item = item
	Pg.ratio = boardWidth / boardHeight
	board.style.width = boardWidth + 'px'

	Pg.status = 0
}

// let a = document.getElementById('playBox')
// let s = a.getBoundingClientRect()


// localStore.set.get
// localStore.set(token, '12345', {
//   expiresIn: 3600,
// })

/**
 * user
 * users pictures
 * current picture
 * timer
 * step 
 *  
*/

function navbar() {
	document.getElementById('navbar-trigger').addEventListener('click', (evt) => {
		document.querySelector('.navbar').classList.toggle('is-open')
	})
}

function loadLocal() {

}

function onCrop() {
	let canvas = cropper.getCroppedCanvas({
		maxWidth: boardWidth,
		width: boardWidth,
		minWidth: boardWidth,
	});

	// document.querySelector('.image-area img').style.display = 'none'
	document.querySelector('.image-area').style.display = 'none'
	canvas.toBlob(function (blob) {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = function () {

			const image = new Image()
			image.src = reader.result
			cropper.destroy();
			cropper = null;
			image.onload = function () {

				game = new Puzzle(image, gridX, gridY)
				game.init()

			}
		};
	});

}

function init() {

	navbar()
	eventFiller()
	initPlaybox()
	handler()
}


function handler(action) {
	// log('action: ', action)
	// log('status: ', Pg.status)
	switch (Pg.status) {
		case (0):
			let btns = document.querySelectorAll('#control button')
			Array.from(btns).forEach(btn => btn.style.display = 'none')
			break;

		case (1):
			Pg.toggle.style.display = ''
			Pg.status = 2
			break;
		case (2):
			if(action === 'toggle') {
				onCrop()	
				Pg.status = 3	
			}
			break;
		case(3):
			if(action === 'toggle') {
				start()
				theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#pause')
				Pg.stop.style.display = ''
				Pg.status = 4
			}
		break;
		case(4):
			if(action === 'toggle') {
				
				theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#play')
				Pg.counter.stop()
				Pg.status = 5
			}
		break;
		case(5):
			if(action === 'toggle') {
				
				theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#pause')
				Pg.counter.run()
				Pg.status = 4
			}
		break;

	}
}

function solved() {
	Pg.counter.stop()
	theUse.setAttributeNS(SVG_XLINK, 'xlink:href', '#play')
}

function control(evt) {
	if(evt.target.id === 'control') return
	let el = (evt.target).closest('button.btn')
	if (!el.dataset || el.dataset.action == '') return

	handler(evt.target.parentElement.parentElement.dataset.action)
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
}

window.addEventListener('load', init)


