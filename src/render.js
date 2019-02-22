let p5 = require('p5')

module.exports = center => {
	return new p5(function() {
		this.setup = function() {
			console.log('SETUPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP')
			this.createCanvas(windowWidth, windowHeight)
			this.background(32)

			this.textSize(16)
			this.textAlign(CENTER)

			this.frameRate(1)
		}

		this.draw = function draw() {
			// clears the canvas
			this.background(32)

			center.areas.forEach(a => {
				a.stations.forEach(s => {
					let c = s.sector.c
					let r = s.sector.r
					let chords = s.sector.chords

					this.noFill()
					this.strokeWeight(4)
					this.stroke('#ffffffaa')

					if (s.sector.chords.length === 0) {
						this.ellipse(c.x, c.y, r * 2, r * 2)
					} else {
						// TODO: render chords and arcs (yeah its hard)
						// arc(c.x, c.y, r, r, 0, 2 * Math.PI)
						this.ellipse(c.x, c.y, r * 2, r * 2)

						chords.forEach(chord => {
							let x1 = r * Math.cos(chord.t1) + c.x
							let y1 = r * Math.sin(chord.t1) + c.y
							let x2 = r * Math.cos(chord.t2) + c.x
							let y2 = r * Math.sin(chord.t2) + c.y

							this.line(x1, y1, x2, y2)
						})
					}

					this.noStroke()
					this.fill('#ffffff')
					this.text(`S${s.id}`, c.x, c.y)
				})
			})
		}
	})
}
