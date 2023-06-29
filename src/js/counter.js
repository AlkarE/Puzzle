export class Counter {
  count = 0
  timer = null
  constructor(element) {
    this.element = element

  }
  render() {
    this.element.innerText = new Date(this.count * 1000).toISOString().slice(11, 19)
  }

  run() {
    this.timer = setInterval(() => {
      this.render()
      this.count++
    }, 1000)
  }
  stop() {
    clearInterval(this.timer)
  }
}
