export class Puzzle {

	// default border width 3 
	constructor(image, gridX, gridY, border = 3) {
		this.border = border
		this.dirty = false
		this.image = image
		this.list = []
		this.origin = []
		this.gridX = gridX
		this.gridY = gridY
		this.solved = false
		this.width = image.width
		this.height = image.height
		this.partWidth = Math.floor(this.width / this.gridX) 
		this.partHeight = Math.floor(this.height / this.gridY) 
		this.box = document.getElementById("playBox")
		this.listener()
		window.Pg.list = this.list
		window.Pg.createdItem = {
			height: this.partHeight,
			width: this.partWidth,
		}

	}
	listener() {

		this.box.addEventListener('click', (evt) => {
			// if (window.Pg.status !== 4) return
			let el = evt.target.parentElement.parentElement
			if (el.classList.contains('item')) {
				let from = this.findTile(+el.dataset.x, +el.dataset.y)

				if (this.canMove(from)) {
					this.swap(from, true)
				}
				if (this.solved) {
					setTimeout(() => {
						const win = new CustomEvent('solved', {
							detail: {
								win: true,
							},
						})

						this.clear()
						this.showImage()
						this.box.dispatchEvent(win)
					}, 500);
				}
			}
		})
		this.box.addEventListener('touchend', (evt) => {
			// if (window.Pg.status !== 4) return
			let el = evt.target.parentElement
			if (el.classList.contains('item')) {
				let from = this.findTile(+el.dataset.x, +el.dataset.y)

				if (this.canMove(from)) {
					this.swap(from, true)
				}
				if (this.solved) {
					setTimeout(() => {
						const win = new CustomEvent('solved', {
							detail: {
								win: true,
							},
						})

						this.clear()
						this.showImage()
						this.box.dispatchEvent(win)
					}, 500);
				}
			}
		})
		// this.box.addEventListener('dragstart', (evt) => {
		// 	if (window.Pg.status !== 4) return
		// 	let el = evt.target.parentElement
		// 	if (el.classList.contains('item')) {
		// 		let from = this.findTile(+el.dataset.x, +el.dataset.y)

		// 		if (this.canMove(from)) {
		// 			this.swap(from, true)
		// 		}
		// 		if (this.solved) {
		// 			setTimeout(() => {
		// 				const win = new CustomEvent('solved', {
		// 					detail: {
		// 						win: true,
		// 					},
		// 				})

		// 				this.clear()
		// 				this.showImage()
		// 				this.box.dispatchEvent(win)
		// 			}, 500);
		// 		}
		// 	}
		// })


	}

	findTile(x, y) {
		return this.list.flat().find(el => el.x === x && el.y === y)
	}

	showImage() {
		this.box.append(this.image)
	}

	checkSolved() {
		let flag = true;
		for (let i = 0; i < this.gridY; ++i) {
			for (let j = 0; j < this.gridX; ++j) {
				if ((this.gridY - 1) === i && (this.gridX - 1) === j) continue
				if (this.list[i][j].x != this.origin[i][j].x
					|| this.list[i][j].y != this.origin[i][j].y
					|| this.list[i][j].marker !== this.origin[i][j].marker) {
					flag = false;
				}
			}
		}
		this.solved = flag;
	}

	// TODO:
	initDom() {

	}

	emptyLoc() {
		return this.list.flat().find(el => el.cnt === null)
	}

	swap(loc, started = false) {
		if (this.solved && !this.dirty) return
		let empty = this.emptyLoc()
		let cnt = loc.cnt
		let marker = loc.marker
		this.list.flat().forEach(el => {
			if (el.x === loc.x && el.y === loc.y) {
				el.cnt = null
				el.marker = empty.marker
				if (started) {
					el.meta = 'from'
				}
			}
			if (el.x === empty.x && el.y === empty.y) {
				el.cnt = cnt
				el.marker = marker
				if (started) {
					el.meta = 'to'
				}
			}
		})
		this.dirty && this.checkSolved()
		this.draw(started)
	}

	draw(started = false) {
		if (!started) {

			this.clear()
		}
		let tile, element, from, to, inner
		for (let i = 0; i < this.gridY; i++) {
			for (let j = 0; j < this.gridX; j++) {

				if (!started) {

					tile = document.createElement('div')
					tile.style.width = this.partWidth + 'px'
					tile.style.height = this.partHeight + 'px'
					tile.dataset.x = i
					tile.dataset.y = j
					tile.classList.add('item')
					inner = document.createElement('div')
					inner.classList.add('inner')
					tile.append(inner)
				}

				element = this.list[i][j]

				element.x = i
				element.y = j
				if (element.cnt) {
					if (!started) {
						inner.append(element.cnt)
					}

					if (element.meta === 'to') {

						to = document.querySelector(`.item[data-x="${i}"][data-y="${j}"]`)
					}

				} else {
					if (!started) {
						let fill = document.createElement('div')
						fill.style.color = 'gray'
						inner.append(fill)
						tile.classList.add('item-empty')
					}
					if (element.meta === 'from') {
						from = document.querySelector(`.item[data-x="${i}"][data-y="${j}"]`)
					}
				}
				if (!started) {
					this.box.append(tile)
				}

			}
		}
		if (started && from && to) {
			this.animate(from, to)
		}

	}
	animate(from, to) {
		let first = to.getBoundingClientRect()
		let last = from.getBoundingClientRect()
		const deltaX = first.left - last.left;
		const deltaY = first.top - last.top;

		let moved = from.querySelector('canvas')


		requestAnimationFrame(function () {
			from.style.zIndex = '2'
			moved.classList.add('moved')
			moved.style.transform = `translate(${deltaX}px, ${deltaY}px)`
		})


		from.addEventListener('transitionend', () => {
			moved.classList.remove('moved')
			moved.style = ''
			from.style.zIndex = ''
			this.list.flat().forEach(el => {
				if (el.meta) {
					delete el.meta
				}

			})
			this.redraw()
		});

	}

	redraw() {
		this.clear()
		let tile, element, inner
		for (let i = 0; i < this.gridY; i++) {
			for (let j = 0; j < this.gridX; j++) {


				tile = document.createElement('div')
				tile.style.width = this.partWidth + 'px'
				tile.style.height = this.partHeight + 'px'
				tile.dataset.x = i
				tile.dataset.y = j
				tile.classList.add('item')
				inner = document.createElement('div')
				inner.classList.add('inner')
				tile.append(inner)

				element = this.list[i][j]

				element.x = i
				element.y = j
				if (element.cnt) {

					inner.append(element.cnt)
				} else {
					let fill = document.createElement('div')
					// fill.style.color = 'gray'
					fill.classList.add('dummy')
					// tile.append(fill)
					tile.classList.add('item-empty')
				}
				this.box.append(tile)
			}
		}
	}

	setBoard() {
		let marker = 0
		for (let i = 0; i < this.gridY; i++) {
			this.list[i] = []
			this.origin[i] = []
			for (let j = 0; j < this.gridX; j++) {
				let canvas = document.createElement('canvas')
				let context = canvas.getContext('2d')
				let w = this.partWidth
				let h = this.partHeight
				canvas.width = w - this.border * 2
				canvas.height = h - this.border * 2
				canvas.draggable = true
				context.drawImage(this.image, w * j, h * i, w, h, 0, 0, w, h);
				this.list[i][j] = {
					x: i,
					y: j,
					marker,
					cnt: canvas
				}
				this.origin[i][j] = {
					x: i,
					y: j,
					marker
				}
				marker++
			}
		}
	}

	init() {
		this.initDom()
		this.setBoard()
		this.draw()

	}

	start() {
		this.removeTile()
		this.shuffle()
		this.draw()
		this.dirty = true
	}

	canMove(from) {
		let to = this.emptyLoc()
		return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) === 1
	}

	getRandom(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	removeTile() {
		this.list[this.gridY - 1][this.gridX - 1].cnt = null
	}

	shuffle(steps = 1000) {
		for (let i = 0; i < steps; i++) {
			let index = this.getRandom(0, this.gridX * this.gridY - 1)
			let tile = this.list.flat()[index]
			if (this.canMove(tile)) {
				this.swap(tile)
			}
		}
	}
	show() {
		log(this.list)
	}
	showOrigin() {
		log(this.origin)
	}
	clear() {
		document.getElementById("playBox").innerHTML = ''
	}
}