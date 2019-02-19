// initialize the central service
let center = Center()
let sleep = function(t) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), t)
	})
}

;(async () => {
	center.newStation({ x: 900, y: 400 }, 200, 0)
	center.newStation({ x: 1200, y: 400 }, 200, 0)
})()
