setInterval(() => {
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = '#111111'
	context.fillRect(0, 0, canvas.width, canvas.height)

	center.areas.forEach(a => {
		a.stations.forEach(s => {
			context.beginPath()
			context.arc(s.sector.c.x, s.sector.c.y, s.sector.r, 0, 2 * Math.PI)
			context.strokeStyle = '#aaa'
			context.lineWidth = 2
			context.stroke()

			context.font = '16px Arial'
			context.fillStyle = '#aaa'
			context.textAlign = 'center'
			context.fillText(`S${s.id}`, s.sector.c.x, s.sector.c.y)
		})
	})
}, 200)
