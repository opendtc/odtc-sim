// initialize the central service
let center = Center()
let sleep = function(t) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), t)
	})
}

;(async () => {
	center.newArea()

	center.newStation({ x: 900, y: 400 }, 100, 0)

	await sleep(2000)
	center.newStation({ x: 1200, y: 300 }, 120, 0)
})()
