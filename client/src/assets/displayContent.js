export default {
	1: {
		instructions: 'Zoom in to find the proposed point of diversion',
		text: ''
	},
	2: {
		instructions: 'Double click on the point of diversion',
		text: ''
	},
	3: {
		text: 'Find watershed',
		instructions: 'Generate watershed from the most downstream point on stream',
		function: 'findBasin'
	},
	4: {
		text: 'Get senior water rights',
		instructions: 'Find all senior water rights in watershed',
		function: 'queryDatabase'
	},
	5: {
		text: 'Sum all diversions',
		instructions: 'Sum all existing permitted diversion amounts within the drainage area',
		function: 'queryDatabaseByBasin'
	}
};