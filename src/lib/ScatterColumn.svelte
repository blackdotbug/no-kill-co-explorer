<script lang="ts">
    import { forceSimulation, 
        type SimulationNodeDatum,
        forceCollide, 
        forceX, 
        forceY
    } from 'd3-force';
    import { lineData, metadata } from './stores.svelte';

    interface DataPoint extends SimulationNodeDatum {
        Facility_Name: string;
        facility_sk: string;
        year: number;
        value: number;
        id: string;
        category: string;
        fill: string;
        fillopacity: number;
        y: number;
        display: string;
    }

    const { colStart, 
        yearData, 
        yScale, 
        radius, 
        hoverHandler, 
        hoverset, 
        dataCategory,
        year,
        statusLegendEntry, 
        category = undefined, 
        col = undefined } = $props();
    let simulationData = $state<null | DataPoint[]>(null);
    const hoverNodes = $derived<undefined | DataPoint[]>(hoverset && simulationData
        ? simulationData.filter(f => f.facility_sk === hoverset) 
        : undefined
    );
    $effect(() => {
        if (dataCategory === "starttotals") {
            lineData.starttotals[`y${year}`] = hoverNodes
        } else if (dataCategory === "location" && category) {
            lineData.location[category][`y${year}`] = hoverNodes
        } else if (dataCategory === "animalcategory" && category) {
            lineData.animalcategory[category][`y${year}`] = hoverNodes 
        } else if (dataCategory === "status" && col && hoverNodes) {
            if (statusLegendEntry[col]) {
                lineData.status[col][statusLegendEntry[col]][`y${year}`] = hoverNodes
            }
        }
    })
    function resetSimulation() {
        forceSimulation().nodes(yearData.filter(f => f.display === "block"))
            .force('x', forceX<DataPoint>(colStart))
            .force('y', forceY<DataPoint>(d => yScale(d.value)).strength(.8))
            .force(
                'collide',
                forceCollide<DataPoint>().radius(radius-2)
            )
            .on("end", function() {
                simulationData = [...this.nodes()] as DataPoint[];
                metadata.nodesExist = true;
            })
    }
    $effect(()=> {
        if(yearData && colStart && radius && !simulationData) {
            resetSimulation();
        }
    })
    $effect(() => {
        console.log(dataCategory, statusLegendEntry.intake, statusLegendEntry.outcome)
        simulationData = null;
        metadata.nodesExist = false;
    })
</script>

{#each simulationData as circ}
<circle
    id={circ.id}
    r={radius}
    cx={circ.x}
    cy={circ.y}
    fill={circ.fill}
    fill-opacity={hoverset && circ.facility_sk === hoverset ? .9 : circ.fillopacity}
    stroke={circ.facility_sk === hoverset ? "black" : "none"}
    onpointerenter={(e) => hoverHandler(e,year,hoverNodes)}
/>
{/each}
