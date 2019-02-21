let sleep = function(t) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), t)
	})
}

let dist = (p1, p2) => {
	return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

let getMeanCenter = stations => {
	if (stations.length === 0) return null
	let sum = stations.reduce(
		(a, c) => {
			a.x += c.sector.c.x
			a.y += c.sector.c.y

			return a
		},
		{ x: 0, y: 0 }
	)

	sum.x /= stations.length
	sum.y /= stations.length

	return sum
}

let dijkstra = (nodes, originId, targetId) => {
	// TODO: ANDY PLEASE WRITE THIS THANKS
	/**
	 * nodes: [
	 *    {
	 *      id: Number,
	 *      edges: [
	 *        { id: Number, cost: Number }
	 *      ]
	 *    }
	 * ],
	 * originId: Number,
	 * targetId: Number
	 */
	/**
	 * please return the shortest path in the form of an array of IDs and the cost
	 * {
	 *    path: [1, 2, 3, 4, ...],
	 *    cost: 1093
	 * }
	 */
}

module.exports = {
	sleep,
	dist,
	getMeanCenter,
	dijkstra
}
