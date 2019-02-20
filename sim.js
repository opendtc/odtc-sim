// initialize the central service
let center = Center()
let sleep = function(t) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), t)
	})
}

;(async () => {
	center.newStation({ x: 500, y: 300 }, 200, 0)
	center.newStation({ x: 500, y: 600 }, 200, 0)

	center.newStation({ x: 1100, y: 300 }, 200, 0)
	center.newStation({ x: 1100, y: 600 }, 200, 0)

	center.newStation({ x: 800, y: 700 }, 200, 0)
})()
