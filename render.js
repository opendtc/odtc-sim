function setup() {
	createCanvas(windowWidth, windowHeight)
	background(32)

	textSize(16)
	textAlign(CENTER)

	frameRate(5)
}

function draw() {
	// clears the canvas
	background(32)

	center.areas.forEach(a => {
		a.stations.forEach(s => {
			let c = s.sector.c
			let r = s.sector.r

			noFill()
			strokeWeight(4)
			stroke('#ffffffaa')

			if (s.sector.chords.length === 0) {
				ellipse(c.x, c.y, r * 2, r * 2)
			} else {
				// arc(c.x, c.y, r, r, 0, 2 * Math.PI)
				// TODO: render chords and arcs (yeah its hard)
			}

			noStroke()
			fill('#ffffff')
			text(`S${s.id}`, c.x, c.y)
		})
	})
}
