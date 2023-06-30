export class Puzzle {

	constructor(image, gridX, gridY) {
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
		window.Pg.createdItem = {
			height: this.partHeight,
			width: this.partWidth,
		}
		console.log('width ', this.width)
		console.log('height ', this.height)
	}
	listener() {
		this.box.addEventListener('click', (evt) => {
			let el = evt.target.parentElement
			if (el.classList.contains('item')) {
				let from = this.findTile(+el.dataset.x, +el.dataset.y)

				if (this.canMove(from)) {
					this.swap(from)
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
			let el = evt.target.parentElement
			if (el.classList.contains('item')) {
				let from = this.findTile(+el.dataset.x, +el.dataset.y)

				if (this.canMove(from)) {
					this.swap(from)
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


	initDom() {
		this.box.style.width = (this.partWidth + 2) * this.gridX + 'px'
		this.box.style.height = (this.partHeight + 2) * this.gridY + 'px'

	}

	emptyLoc() {
		return this.list.flat().find(el => el.cnt === null)
	}

	swap(loc) {
		if (this.solved && !this.dirty) return
		let empty = this.emptyLoc()
		let cnt = loc.cnt
		let marker = loc.marker
		this.list.flat().forEach(el => {
			if (el.x === loc.x && el.y === loc.y) {
				el.cnt = null
				el.marker = empty.marker
			}
			if (el.x === empty.x && el.y === empty.y) {
				el.cnt = cnt
				el.marker = marker
			}
		})
		this.dirty && this.checkSolved()
		this.draw()
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
				canvas.width = w
				canvas.height = h
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

	draw() {
		this.clear()
		for (let i = 0; i < this.gridY; i++) {
			for (let j = 0; j < this.gridX; j++) {
				let tile = document.createElement('div')
				tile.style.width = this.partWidth + 'px'
				tile.style.height = this.partHeight + 'px'
				tile.dataset.x = i
				tile.dataset.y = j
				tile.classList.add('item')


				this.list[i][j].x = i
				this.list[i][j].y = j
				if (this.list[i][j].cnt) {
					tile.append(this.list[i][j].cnt)

				} else {
					tile.classList.add('item-empty')
				}
				this.box.append(tile)
			}
		}

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