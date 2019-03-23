import Station from './Station'
import Location from './Location'

export let sleep = function(t: number) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), t)
	})
}

export let dist = (p1: Location | null, p2: Location | null) => {
	if (!p1 || !p2) return Number.MAX_VALUE
	return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

export let getMeanCenter = (stations: Station[]): Location | null => {
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

export let dijkstra = (
	nodes: { id: number; edges: { id: number; cost: number }[] }[],
	originId: number,
	targetId: number
) => {
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
	return {
		path: [],
		cost: 0
	}
}
