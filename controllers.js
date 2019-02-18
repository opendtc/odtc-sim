let dist = (p1, p2) => {
	return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

let Sector = (c, r, chords) => {
	return {
		c,
		r,
		chords,
		addChord: (t1, t2) => {
			// adds a chord, restricting the airspace of this sector
			this.chords.push({ t1, t2 })
		},
		isInside: s => {
			// checks if point s is inside this sector
			// first check if s is outside the circle
			let distance = dist(s, c)
			if (distance > r) return false

			// check that s is on the center side of each chord

			let theta = Math.atan2(s.y, s.x)
			for (chord of this.chords) {
				if (theta < chord.t1 && theta > chord.t2) {
					// s is in angle range of this chord, check its distance
					// TODO:
				}
			}
		}
	}
}

let Center = () => {
	return {
		areas: [],
		newStation: (location, range, id) => {},
		newArea: stations => {},
		noFlyZones: []
	}
}

let AreaController = (center, stations) => {}

let Station = (location, range, id) => {}
