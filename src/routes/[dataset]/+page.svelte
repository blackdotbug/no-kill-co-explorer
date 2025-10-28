<script lang="ts">
	import type { PageProps } from './$types';
	const { params, data }: PageProps = $props();
    import { schemeSet2 } from 'd3-scale-chromatic';
    import { rollup, sum, group } from 'd3-array';
    import ScatterTimeline from '$lib/ScatterTimeline.svelte';
    import { metadata } from '$lib/stores.svelte';
    const dataCategory = $derived(params.dataset);
    $effect(() => metadata.currentpage = dataCategory)
    const colorCategories = $derived(
        dataCategory === "starttotals"
            ? ["startTotal"]
            : dataCategory === "location"
                ? ["sheltertotal", "fostertotal"]
                : dataCategory === "animalcategory" && data.dataset?.length
                    ? Array.from(new Set(data.dataset.map(m => m.animal_category)))
                    : dataCategory === "status" 
                        ? ["intake", "outcome"]
                        : []
    );
    const colors = $derived(
        dataCategory === "starttotals"
            ? ["lightblue"]
            : dataCategory === "location"
                ? ["#0d3001", "#ebb402"]
                : dataCategory === "animalcategory" 
                    ? [...schemeSet2]
                    : dataCategory === "status"
                        ? ["#002e2c", "#800371"]
                        : []
    );
    const dataset = $derived(
        dataCategory === "starttotals" && data.dataset.startTotals?.length
            ? rollup(data.dataset.startTotals, v => sum(v, d => d.sheltertotal + d.fostertotal), d => d.year, d => d.facility_sk)
            : dataCategory === "location" && data.dataset.startTotals?.length
                ? group(data.dataset.startTotals, d => d.year, d => d.facility_sk)
                : dataCategory === "animalcategory" && data.dataset?.length
                    ? rollup(data.dataset, v => sum(v, d => d.start_foster && d.start_shelter ? d.start_foster + d.start_shelter : 0), d => d.year, d => d.facility_sk, d => d.animal_category)
                    : dataCategory === "status" && data.dataset.intakeTotals?.length && data.dataset.outcomeTotals?.length
                        ? new Map([['intake', group(data.dataset.intakeTotals, d => d.year, d => d.facility_sk)],['outcome', group(data.dataset.outcomeTotals, d => d.year, d => d.facility_sk)]])
                        : null
    );
    const maxR = $derived(
        dataCategory === "starttotals" && data.dataset.startTotals?.length
            ? Math.max(...data.dataset.startTotals.map(m => m.sheltertotal + m.fostertotal))
            : dataCategory === "location" && data.dataset.startTotals?.length
                ? Math.max(Math.max(...data.dataset.startTotals.map(m => m.sheltertotal)), Math.max(...data.dataset.startTotals.map(m => m.fostertotal)))
                : dataCategory === "animalcategory" && data.dataset?.length
                    ? Math.max(...data.dataset.map(m => m.start_foster + m.start_shelter))
                    : dataCategory === "status" && data.dataset.intakeTotals?.length && data.dataset.outcomeTotals?.length
                        ? Math.max( Math.max(...data.dataset.intakeTotals.flatMap(m => {
                                const keys = Object.keys(m).filter(f => f !== "year" && f !== "facility_sk")
                                return keys.map(k => m[k])
                            })),
                            Math.max(...data.dataset.outcomeTotals.flatMap(m => {
                                const keys = Object.keys(m).filter(f => f !== "year" && f !== "facility_sk")
                                return keys.map(k => m[k])
                            })))
                        : 0
    );
</script>

{#if dataset && colorCategories.length && colors.length && maxR && maxR > 0}
<ScatterTimeline 
    {dataCategory}
    {dataset}
    facilities={data.facilities}
    {colorCategories}
    {colors}
    {maxR}
/>    
{/if}