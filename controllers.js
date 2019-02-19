let dist = (p1, p2) => {
	return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

let Sector = (c, r, chords) => {
	return {
		c,
		r,
		chords,
		addChord: function(t1, t2) {
			// adds a chord, restricting the airspace of this sector
			this.chords.push({ t1, t2 })
		},
		isInside: function(s) {
			// checks if point s is inside this sector
			// first check if s is outside the circle
			let distance = dist(s, c)
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
		},
		doesCircleIntersect: function(c, r) {
			// checks if this sector's circle intersects with the given circle
			return dist(c, this.c) < r + this.r
		}
	}
}

let getMeanCenter = stations => {
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

// TODO: add split/merge/movestation functions
let Area = (id, existingAreas) => {
	let newArea = {
		meanCenter: null,
		stations: [],
		otherAreas: existingAreas,
		neighboringAreas: [],
		id: id,
		generateTypeAFlightPlan: function() {}, // TODO:
		generateTypeSFlightPlan: function() {}, // TODO:
		isInside: s => {
			// check if s is inside area
			for (station of stations) {
				if (station.sector.isInside(s)) return true
			}
			return false
		}
	}

	existingAreas.forEach(a => a.otherAreas.push(newArea))
	return newArea
}

let Center = () => {
	return {
		nextStationId: 0,
		nextAreaId: 0,
		areas: [],
		stations: [],
		newStation: function(location, range) {
			// before all else, check that the center of this station is not inside another sector
			// also check that this station's range doesn't encompass other stations
			for (station of this.stations) {
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
					else neighborStationsOutsideArea.push(s)
				})
			} else {
				// if no stations are neighbors, then create a new area
				area = Area(nextAreaId++, this.areas)
				this.areas.push(area)
			}

			let sector = Sector(location, range)

			intersectingStations.forEach(s => {
				// https://stackoverflow.com/questions/3349125/circle-circle-intersection-points
				let d = dist(s.sector.c, location)
				let a = (range ** 2 - s.sector.r ** 2 + d ** 2) / (2 * d)
				let b = d - a

				// t01 is the heading of the other station from the POV of the new station
				let t01 = Math.atan2(
					s.sector.c.y - location.y,
					s.sector.c.x - location.x
				)

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

			let newStation = {
				id: this.nextStationId++,
				sector,
				areaId: area.id,
				neighborStationsInArea,
				neighborStationsOutsideArea,
				stationsInArea: area.stations,
				generateTypeSFlightPlan: function() {}
			}

			area.stations.forEach(s => s.stationsInArea.push(newStation)) // add this station to the station list of all other stations in the area
			area.stations.push(newStation) // add this station to the area
			this.stations.push(newStation) // add this station to center list

			area.meanCenter = getMeanCenter(area.stations)
		},
		newArea: function(stations = []) {},
		noFlyZones: [] // TODO:
	}
}
