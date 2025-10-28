<!-- Quadtree.svelte -->
<script>
  import { quadtree } from 'd3-quadtree';

  // Props declaration using $props
  let {
    xScale,
    yScale,
    xKey,
    yKey,
    data,
    searchRadius = undefined,
    children // Pass rendering logic as a prop
  } = $props();

  // State declarations
  let visible = $state(false);
  let found = $state(null);
  let e = $state({});
  let finder = $state(null);

  // Create quadtree when data changes
  $effect(() => {
    if (data && xScale && yScale) {
      finder = quadtree()
        .x((d) => xScale(d[xKey]))
        .y((d) => yScale(d[yKey]))
        .addAll(data);
    }
  });

  // Function to find item in the quadtree
  function findItem(evt) {
    const { layerX, layerY } = evt;

    if (finder) {
      const result = finder.find(layerX, layerY, searchRadius);
      // console.log(layerX, layerY, result)
      found = result || null;
      visible = result !== null;
      e = evt;
    }
  }

  // Get position for found data
  function getPosition(foundItem) {
    // console.log(foundItem)
    if (foundItem[xKey] && foundItem[yKey]) {
      const xPos = xScale(foundItem[xKey]);
      return xPos > 0.9 * xScale.range()[1]
        ? { circle: xPos, square: xPos - 100 }
        : { circle: xPos, square: xPos };
    }
    return null;
  }

  // Computed values
  const position = $derived(found ? getPosition(found) : null);
  const yPosition = $derived(found ? yScale(found[yKey]) : null);
</script>

<div
  aria-hidden
  class="bg"
  onmousemove={findItem}
  onblur={() => {
    visible = false;
    found = null;
  }}
  onmouseout={() => {
    visible = false;
    found = null;
  }}>
</div>

{#if found && position && yPosition}
  {@render children({
    x: position,
    y: yPosition,
    found,
    visible,
    e
  })}
{/if}

<style>
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>