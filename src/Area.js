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
