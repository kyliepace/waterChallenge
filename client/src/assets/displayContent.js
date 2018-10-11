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
		instructions: 'Generate watershed from the selected water right point of diversion',
		function: 'findBasin'
	},
	{
		text: 'Get senior water rights',
		instructions: 'Find all senior water rights in watershed',
		function: 'queryDatabaseByBasin'
	},
	{
		text: 'Download table',
		instructions: 'Download table of all water rights and diversion info within selected basin',
		function: 'exportTable'
	}
];