// initialize the central service
let center = Center()
let sleep = function(t) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), t)
	})
}

;(async () => {
	center.newStation({ x: 900, y: 400 }, 200, 0)

	await sleep(2000)
	center.newStation({ x: 1200, y: 400 }, 200, 0)

	await sleep(2000)
	center.newStation({ x: 1050, y: 600 }, 200, 0)

	await sleep(2000)
	center.newStation({ x: 1050, y: 250 }, 200, 0)
})()
