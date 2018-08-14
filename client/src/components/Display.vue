<template>
	<div id='info'>
		<span>{{instructions}}</span>
		<button @click='handleClick'>{{button}}</button>
	</div>
</template>

<script>
import content from '../assets/displayContent.js'

export default{
	name: 'Display',
	props: ['counter'],

	mounted(){

	},
	computed: {
		button(){
			return content[this.counter].text;
		},
		instructions(){
			return content[this.counter].instructions;
		}
	},
	methods: {
		handleClick(){
			this.$emit('increaseCounter');
		}
	}
}
</script>

<style scoped>
#info{
	width: 300px;
	height: 100%;
	/*position: absolute;
	z-index: 1000;
	top: 0; */
}
</style>