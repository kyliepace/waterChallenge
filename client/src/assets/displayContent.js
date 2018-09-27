export default [
	{
		instructions: 'Zoom in to find the proposed point of diversion',
		text: ''
	},
	{
		instructions: 'Double click on the point of diversion',
		text: ''
	},
	{
		text: '',
		instructions: 'Select the most downstream water rights holder'
	},
	{
		text: 'Find watershed',
		instructions: 'Generate watershed from the most downstream point of diversion',
		function: 'findBasin'
	},
	{
		text: 'Get senior water rights',
		instructions: 'Find all senior water rights in watershed',
		function: 'queryDatabaseByBasin'
	},
	{
		text: 'Sum all diversions',
		instructions: 'Sum all existing permitted diversion amounts within the drainage area',
		function: 'queryDatabaseByBasin'
	}
];