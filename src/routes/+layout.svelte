<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<style>
  :global(body) {
    font-family: 'Roboto', sans-serif;
  }
</style>

{@render children()}
