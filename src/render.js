let p5 = require('p5')
let center

let s = sketch => {
	sketch.setup = function() {
		// console.log(window)
		sketch.createCanvas(window.innerWidth, window.innerHeight)
		sketch.background(32)

		sketch.textSize(16)
		sketch.textAlign(sketch.CENTER)

		sketch.frameRate(1)
	}

	sketch.draw = function() {
		// clears the canvas
		sketch.background(32)

		center.areas.forEach(a => {
			a.stations.forEach(s => {
				let c = s.sector.c
				let r = s.sector.r
				let chords = s.sector.chords

				sketch.noFill()
				sketch.strokeWeight(4)
				sketch.stroke('#ffffffaa')

				if (s.sector.chords.length === 0) {
					sketch.ellipse(c.x, c.y, r * 2, r * 2)
				} else {
					// TODO: render chords and arcs (yeah its hard)
					// arc(c.x, c.y, r, r, 0, 2 * Math.PI)
					sketch.ellipse(c.x, c.y, r * 2, r * 2)

					chords.forEach(chord => {
						let x1 = r * Math.cos(chord.t1) + c.x
						let y1 = r * Math.sin(chord.t1) + c.y
						let x2 = r * Math.cos(chord.t2) + c.x
						let y2 = r * Math.sin(chord.t2) + c.y

						sketch.line(x1, y1, x2, y2)
					})
				}

				sketch.noStroke()
				sketch.fill('#ffffff')
				sketch.text(`S${s.id}`, c.x, c.y)
			})
		})
	}
}

module.exports = c => {
	center = c
	return new p5(s)
}
