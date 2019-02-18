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

let Center = () => {
	return {
		nextStationId: 0,
		nextAreaId: 0,
		areas: [],
		newStation: function(location, range, areaId) {
			let area = this.areas.filter(a => a.id === areaId)[0]

			// no new stations with centers that are inside existing jurisdiction
			if (area.isInside(location)) return

			// no new stations that are completely detached from existing jurisdiction
			// TODO:

			let newStation = {
				id: this.nextStationId++,
				sector: Sector(location, range, []),
				area,
				otherStations: area.stations,
				generateTypeSFlightPlan: function() {}
			}

			area.stations.forEach(s => s.otherStations.push(newStation))
			area.stations.push(newStation)

			area.meanCenter = getMeanCenter(area.stations)
		},
		newArea: function(stations = []) {
			let existingAreas = this.areas
			let newArea = {
				meanCenter: stations.length > 0 ? getMeanCenter(stations) : {},
				stations,
				otherAreaControllers: existingAreas,
				id: this.nextAreaId++,
				// TODO: actually implementing the newStation and newArea protocols
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

			this.areas.forEach(a => a.otherAreaControllers.push(newArea))
			this.areas.push(newArea)
		},
		noFlyZones: [] // TODO:
	}
}
