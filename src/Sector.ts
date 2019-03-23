import { dist } from './utils'
import Chord from './Chord'
import Location from './Location'

export default class Sector {
	c: Location
	r: number
	chords: Chord[]

	constructor(c: Location, r: number, chords: Chord[]) {
		this.c = c
		this.r = r
		this.chords = chords
	}

	addChord(t1: number, t2: number) {
		// adds a chord, restricting the airspace of this sector
		this.chords.push({ t1, t2 })
	}

	isInside(s: Location) {
		// checks if point s is inside this sector
		// first check if s is outside the circle
		let distance = dist(s, this.c)
		if (distance > this.r) return false

		// check that s is on the center side of each chord

		let theta = Math.atan2(s.y, s.x)
		for (let chord of this.chords) {
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

	doesCircleIntersect(c: Location, r: number) {
		// checks if this sector's circle intersects with the given circle
		return dist(c, this.c) < r + this.r
	}
}
