let hasCenterBeenInstantiated = false
class Center {
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
