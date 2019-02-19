function setup() {
	createCanvas(windowWidth, windowHeight)
	background(32)

	textSize(16)
	textAlign(CENTER)

	frameRate(1)
}

function draw() {
	// clears the canvas
	background(32)

	center.areas.forEach(a => {
		a.stations.forEach(s => {
			let c = s.sector.c
			let r = s.sector.r
			let chords = s.sector.chords

			noFill()
			strokeWeight(4)
			stroke('#ffffffaa')

			if (s.sector.chords.length === 0) {
				ellipse(c.x, c.y, r * 2, r * 2)
			} else {
				// TODO: render chords and arcs (yeah its hard)
				// arc(c.x, c.y, r, r, 0, 2 * Math.PI)
				ellipse(c.x, c.y, r * 2, r * 2)

				chords.forEach(chord => {
					let x1 = r * Math.cos(chord.t1) + c.x
					let y1 = r * Math.sin(chord.t1) + c.y
					let x2 = r * Math.cos(chord.t2) + c.x
					let y2 = r * Math.sin(chord.t2) + c.y

					line(x1, y1, x2, y2)
				})
			}

			noStroke()
			fill('#ffffff')
			text(`S${s.id}`, c.x, c.y)
		})
	})
}
