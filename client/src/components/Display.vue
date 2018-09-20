<template>
	<div id='info'>
		<span>{{instructions}}</span>
		<button
			 v-if='this.content[this.counter].text'
			 @click='handleClick'
			 :disabled='this.loading'
		>
			{{button}}
		</button>
	</div>
</template>

<script>
import content from '../assets/displayContent.js'

export default{
	name: 'Display',
	props: ['counter', 'loading'],
	data() {
		return {
			content: content
		}
	},
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
			let toDo = content[this.counter].function;
			if (toDo) {
				this.$emit(toDo);
			}
			else {
				this.$emit('increaseCounter');
			}
		}
	}
}
</script>

<style scoped>
#info{
	width: 300px;
	height: 100%;
	padding: 20px;
	/*position: absolute;
	z-index: 1000;
	top: 0; */
}
</style>