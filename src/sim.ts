import Center from './Center'
import render from './render'

// initialize the central service
let center: Center = new Center()

render(center)
;(async () => {
	center.newStation({ x: 500, y: 300 }, 200)
	center.newStation({ x: 500, y: 600 }, 200)
	center.newStation({ x: 1100, y: 300 }, 200)
	center.newStation({ x: 1100, y: 600 }, 200)
	center.newStation({ x: 800, y: 700 }, 200)
})()
