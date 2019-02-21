(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let { getMeanCenter } = require('./utils')

module.exports = class Area {
	constructor(id, existingAreas, stations = [], neighboringAreas = []) {
		this.meanCenter = getMeanCenter(stations)
		this.stations = stations
		this.allAreas = existingAreas
		this.neighboringAreas = neighboringAreas
		this.id = id
	}

	generateTypeAFlightPlan(dest) {
		let targetArea = this.allAreas.filter(a => a.isInside(dest))[0]

		// convert allAreas into a simpler graph to work with
		let nodes = this.allAreas.map(a => ({
			id: a.id,
			edges: a.neighboringAreas.map(neighbor => ({
				id: neighbor.id,
				// TODO: consider traffic, weather, and other factors in cost for dijkstras
				cost: dist(a.meanCenter, neighbor.meanCenter)
			}))
		}))

		return dijkstra(nodes, this.id, targetArea.id).path
	}

	generateTypeSFlightPlan(originStationId, targetAreaId) {
		// generates a flight plan to appropriate sector for handoff to area with id areaId

		// find the station(s) in this area that connects to that area
		let handOffStations = this.stations.filter(s => {
			return s.neighborStationsOutsideArea
				.map(nS => nS.areaId)
				.includes(targetAreaId)
		})

		// convert stations into a simpler graph to work with
		let nodes = this.stations.map(s => ({
			id: s.id,
			edges: s.neighborStationsInArea.map(neighbor => ({
				id: neighbor.id,
				cost: dist(s.sector.c, neighbor.sector.c)
			}))
		}))

		// perform dijkstra's on each of the possible handoff stations, and find the one that yields the shortest path
		let cost = Number.MAX_SAFE_INTEGER,
			bestPath
		handOffStations.forEach(s => {
			let res = dijkstra(nodes, originStationId, s.id)
			if (res.cost < cost) bestPath = res.path
		})

		return {
			path: bestPath,
			terminator: `HANDOFF-${targetAreaId}`
		}
	}

	isInside(s) {
		// check if s is inside area
		for (station of this.stations) {
			if (station.sector.isInside(s)) return true
		}
		return false
	}
}

},{"./utils":6}],2:[function(require,module,exports){
let Area = require('./Area')
let Sector = require('./Sector')
let Station = require('./Station')
let { getMeanCenter, dist } = require('./utils')

let hasCenterBeenInstantiated = false
module.exports = class Center {
	constructor() {
		if (hasCenterBeenInstantiated)
			throw 'Center has already been instantiated, there may only be one Center per runtime'

		this.nextStationId = 0
		this.nextAreaId = 0
		this.areas = []
		this.stations = []
		this.noFlyZones = [] // TODO: handle NFZs

		hasCenterBeenInstantiated = true
	}

	newStation(location, range) {
		// before all else, check that the center of this station is not inside another sector
		// also check that this station's range doesn't encompass other stations
		for (let station of this.stations) {
			if (station.sector.isInside(location)) return
			if (dist(station.sector.c, location) < range) return
		}

		// first, check if the station intersects with any other station
		let intersectingStations = this.stations.filter(s =>
			s.sector.doesCircleIntersect(location, range)
		)

		let area,
			neighborStationsInArea = [],
			neighborStationsOutsideArea = []
		if (intersectingStations.length > 0) {
			// if there are intersecting stations, add this station to one of those areas
			let areaId = intersectingStations[0].areaId
			area = this.areas[areaId]

			// separate intersecting stations into those in this area and those in other areas
			intersectingStations.forEach(s => {
				if (s.areaId === areaId) neighborStationsInArea.push(s)
				else {
					neighborStationsOutsideArea.push(s)

					// make sure that this neighbor station's area is added as a neighbor area of this area
					if (!area.neighboringAreas.map(a => a.id).includes(s.areaId)) {
						area.neighboringAreas.push(this.areas[s.areaId])
					}

					if (
						!this.areas[s.areaId].neighboringAreas
							.map(a => a.id)
							.includes(areaId)
					) {
						this.areas[s.areaId].neighboringAreas.push(area)
					}
				}
			})
		} else {
			// if no stations are neighbors, then create a new area
			area = new Area(this.nextAreaId++, this.areas)
			this.areas.push(area)
		}

		let sector = new Sector(location, range, [])

		intersectingStations.forEach(s => {
			// https://stackoverflow.com/questions/3349125/circle-circle-intersection-points
			let d = dist(s.sector.c, location)
			let a = (range ** 2 - s.sector.r ** 2 + d ** 2) / (2 * d)
			let b = d - a

			// t01 is the heading of the other station from the POV of the new station
			let t01 = Math.atan2(s.sector.c.y - location.y, s.sector.c.x - location.x)

			// t10 is the heading of the new station from the POV of the other station
			let t10 = t01 + Math.PI
			if (t10 > Math.PI * 2) t10 -= Math.PI * 2

			let dt0 = Math.acos(a / range) // angle differential for new station
			let dt1 = Math.acos(b / s.sector.r) // angle differential for other station

			// push to this stations chords
			sector.addChord(t01 + dt0, t01 - dt0)

			// push to neighbor's chords
			s.sector.addChord(t10 + dt1, t10 - dt1)
		})

		let newStation = new Station(
			this.nextStationId++,
			sector,
			area.id,
			neighborStationsInArea,
			neighborStationsOutsideArea,
			area.stations
		)

		area.stations.push(newStation) // add this station to the area
		this.stations.push(newStation) // add this station to center list

		area.meanCenter = getMeanCenter(area.stations)
	}

	splitArea(areaId, stationIds) {
		// TODO:
		// check that the area exists and the stations are inside the area
		// perform the move
		// create a new area (generate meanCenter, populate stations, allAreas, and neighboringAreas and id)
		// update old area
		// update all stations as necessary
	}
	mergeAreas(a1, a2) {
		// TODO:
		// check that both areas exist and are neighbors
		// perform the move
		// merge neighboringAreas (and remove the merged area), regenerate meanCenter
		// update station areaId, stationsInArea, neighborStationsInArea, neighborStationsOutsideArea
		// update all other areas
	}
	moveStationToArea(stationId, areaId) {
		// TODO:
		// check that the station and area exist
		// check that target station actually neighbors the target area
		// perform the move
		// modify Area meanCenters, station list, neighboringAreas
		// update station areaId, stationsinarea, neighborsinarea, neighborsoutsidearea
	}
}

},{"./Area":1,"./Sector":3,"./Station":4,"./utils":6}],3:[function(require,module,exports){
let { dist } = require('./utils')

module.exports = class Sector {
	constructor(c, r, chords) {
		this.c = c
		this.r = r
		this.chords = chords
	}

	addChord(t1, t2) {
		// adds a chord, restricting the airspace of this sector
		this.chords.push({ t1, t2 })
	}

	isInside(s) {
		// checks if point s is inside this sector
		// first check if s is outside the circle
		let distance = dist(s, this.c)
		if (distance > this.r) return false

		// check that s is on the center side of each chord

		let theta = Math.atan2(s.y, s.x)
		for (chord of this.chords) {
			if (theta < chord.t1 && theta > chord.t2) {
				// s is in angle range of this chord, check its distance
				let chordRange = chord.t1 - chord.t2
				let l = this.r * Math.cos(chordRange / 2)
				let deviation = Math.abs(theta - (chord.t1 + chord.t2) / 2)
				let maxAllowedDist = l / Math.cos(deviation)

				if (distance > maxAllowedDist) return false
			}
		}

		return true
	}

	doesCircleIntersect(c, r) {
		// checks if this sector's circle intersects with the given circle
		return dist(c, this.c) < r + this.r
	}
}

},{"./utils":6}],4:[function(require,module,exports){
module.exports = class Station {
	constructor(
		id,
		sector,
		areaId,
		neighborStationsInArea,
		neighborStationsOutsideArea,
		stationsInArea
	) {
		this.id = id
		this.sector = sector
		this.areaId = areaId
		this.neighborStationsInArea = neighborStationsInArea
		this.neighborStationsOutsideArea = neighborStationsOutsideArea
		this.stationsInArea = stationsInArea
	}

	generateTypeSFlightPlan(dest) {
		// this function is called when the destination of the inspected drone is within this area
		let destStation = this.stationsInArea.filter(s =>
			s.sector.isInside(dest)
		)[0]

		// convert stations into a simpler graph to work with
		let nodes = this.stationsInArea.map(s => ({
			id: s.id,
			edges: s.neighborStationsInArea.map(neighbor => ({
				id: neighbor.id,
				cost: dist(s.sector.c, neighbor.sector.c)
			}))
		}))

		let res = dijkstra(nodes, this.id, destStation.id)

		return {
			path: res.path,
			terminator: `LOCAL`
		}
	}
}

},{}],5:[function(require,module,exports){
let Center = require('./Center')

// initialize the central service
let center = new Center()

;(async () => {
	center.newStation({ x: 500, y: 300 }, 200, 0)
	center.newStation({ x: 500, y: 600 }, 200, 0)

	center.newStation({ x: 1100, y: 300 }, 200, 0)
	center.newStation({ x: 1100, y: 600 }, 200, 0)

	center.newStation({ x: 800, y: 700 }, 200, 0)
})()

},{"./Center":2}],6:[function(require,module,exports){
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

},{}]},{},[5]);
