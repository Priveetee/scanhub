<script lang="ts">
	import '../app.css';
	import Aurora from '$lib/components/Aurora.svelte';
	
	let { children } = $props();
  </script>
  
  <div class="relative min-h-screen w-full overflow-hidden">
	<!-- Aurora background effect -->
	<Aurora
	  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
	  speed={0.8}
	  amplitude={1.2}
	/>
	
	<!-- Page content -->
	<div class="relative z-10 min-h-screen w-full">
	  {@render children()}
	</div>
  </div>