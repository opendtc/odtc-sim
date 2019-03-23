import Sector from './Sector'
import { dist, dijkstra } from './utils'
import Location from './Location'

export default class Station {
	id: number
	sector: Sector
	areaId: number
	neighborStationsInArea: Station[]
	neighborStationsOutsideArea: Station[]
	stationsInArea: Station[]

	constructor(
		id: number,
		sector: Sector,
		areaId: number,
		neighborStationsInArea: Station[],
		neighborStationsOutsideArea: Station[],
		stationsInArea: Station[]
	) {
		this.id = id
		this.sector = sector
		this.areaId = areaId
		this.neighborStationsInArea = neighborStationsInArea
		this.neighborStationsOutsideArea = neighborStationsOutsideArea
		this.stationsInArea = stationsInArea
	}

	generateTypeSFlightPlan(dest: Location) {
		// this function is called when the destination of the inspected drone is within this area
		let destStation = this.stationsInArea.filter(s =>
			s.sector.isInside(dest)
		)[0]

		// convert stations into a simpler graph to work with
		let nodes = this.stationsInArea.map(s => ({
			id: s.id,
			edges: s.neighborStationsInArea.map(neighbor => ({
				id: neighbor.id,
				cost: dist(s.sector.c, neighbor.sector.c)
			}))
		}))

		let res = dijkstra(nodes, this.id, destStation.id)

		return {
			path: res.path,
			terminator: `LOCAL`
		}
	}
}
