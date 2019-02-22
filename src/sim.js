let Center = require('./Center')

// initialize the central service
let center = new Center()

require('./render')(center)
;(async () => {
	center.newStation({ x: 500, y: 300 }, 200, 0)
	center.newStation({ x: 500, y: 600 }, 200, 0)

	center.newStation({ x: 1100, y: 300 }, 200, 0)
	center.newStation({ x: 1100, y: 600 }, 200, 0)

	center.newStation({ x: 800, y: 700 }, 200, 0)
})()
