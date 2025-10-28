<script lang="ts">
    import { scaleBand, scaleOrdinal, scaleLog, scaleLinear } from 'd3-scale';
    import { type SimulationNodeDatum } from 'd3-force';
    import Lines from './Lines.svelte';
	import ScatterColumn from './ScatterColumn.svelte';
	import { InternMap } from 'd3-array';
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

    const { dataset, facilities, dataCategory, colorCategories, colors, maxR } = $props();
    let width = $state(0);
    let height = $state(0);
    let statusLegendEntry = $state<{intake: string, outcome: string}>({intake: "in_state_transfer", outcome: "adoption"});
    let hoverset = $state<string>("");
    function handleHover(e) {
        const hoverID = e.target.id;
        const facility = hoverID.split("_")[0];
        hoverset = facility;
    }
    function setStatusLegendEntry(cat,i) {
        hoverset = ""
        statusLegendEntry[colorCategories[i]] = cat
    }
    $effect(() => {
        console.log("datacategory changed", dataCategory);
        hoverset = "";
    })
    const margin = {
        top: 40,
        right: 40,
        bottom: 100,
        left: 20
    };
    const innerwidth = $derived(width - margin.left - margin.right);
    const innerheight = $derived(height - margin.top - margin.bottom);
    const years = $derived(dataset 
        ? dataCategory === "status"
            ? Array.from(dataset.get("intake").keys()).sort()
            : Array.from(dataset.keys()).sort() 
        : []);
    const xScale = $derived(scaleBand().range([0, innerwidth]).domain(years));
    const yScale = $derived(scaleLog().domain([1, maxR]).range([innerheight, 0]));
    const yFormat = $derived(yScale.tickFormat())
    const colorScale = $derived(scaleOrdinal().domain(colorCategories).range(colors));
    const radius = 6;
</script>
<div
  class="flex w-full h-160 flex-col items-center"
  bind:clientWidth={width}
  bind:clientHeight={height}
>
    {#if colorCategories.length && colors.length}
    <div id="legend" class="flex justify-items-end w-full p-2 {dataCategory}">
    {#if dataCategory !== "status"}
        {#each colorCategories as cat}
            <div class="flex w-40 items-baseline entry">
                <div class="swatch rounded-full h-3 w-3 mr-3" 
                    style={`background: ${colorScale(cat)}`}></div>
                <div class="label">{cat}</div>
            </div>
        {/each}
    {:else}
    {#if dataset && years.length}     
    {@const legendCategories = colorCategories.map(m => {
        const val = dataset.get(m).get(years[0]);
        const row = val.entries().next().value[1][0]
        if (row && typeof row === "object") {
            const keys = Object.keys(row).filter(f => f !== "year" && f !== "facility_sk");
            if (keys.length) {
                return keys
            } else { return []}
        } else { return []}
    })}
        {#each legendCategories as cats, index}
        <!-- {@const opacityScale = scaleLinear().domain([0, cats.length-1]).range([0.3,0.9])} -->
        <div class="sublegend flex flex-row w-full h-10">
            <h4 class="font-bold">{colorCategories[index]}:</h4>
            {#each cats as cat, i}
            <div class={`entry flex flex-row items-baseline h-6 ml-5 ${cat === statusLegendEntry[colorCategories[index]] ? "border-b-2" : ""}`} 
                tabindex={i + index} 
                role="button" 
                onkeyup={()=> setStatusLegendEntry(cat,index)} 
                onclick={()=> setStatusLegendEntry(cat,index)}>
                <div class="swatch rounded-full h-3 w-3 mr-3"
                    style={`background: ${colorScale(colorCategories[index])}; opacity: ${
                    statusLegendEntry[colorCategories[index]] === cat
                    ? 1 : 0
                    }`}
                ></div>
                <div
                >{cat.replaceAll("_", " ")}</div>
            </div>
            {/each}
        </div>
        {/each}
    {/if}   
    {/if}
    </div>
    {/if}
    <div class="relative">
    {#if width > 0 && height > 0 && years.length > 0 && dataset && typeof dataset === "object" && xScale && yScale}
        <svg width={width} height={height}>
            {#if hoverset && facilities?.length > 0}
            <g 
                transform={`translate(${innerwidth},${margin.top/2})`}
            >
            <text text-anchor="end" class="font-bold text-xl">
                {facilities.find(f => f.facility_sk === hoverset).Facility_Name}
            </text>
            </g>
            {/if}
            <g id="yAxis" transform={`translate(10, ${margin.top})`}>
                {#each yScale.ticks(12) as tick}
                {@const formatted = yFormat(tick)}
                {#if formatted}
                <line 
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    x1={0}
                    x2={width - (margin.right/2)}
                />                
                <text class="text-sm"
                    y={yScale(tick)}
                    dy=-3
                >{tick}</text>
                {/if}
                {/each}
            </g>
            <g id="xAxis" transform={`translate(${margin.left}, ${height - (margin.bottom - 30)})`}>
                {#each years as tick}
                <text class="text-sm"
                    transform={`translate(${xScale(tick) + xScale.bandwidth()/2}, 0)`}
                >{tick}</text>
                {#if metadata.nodesExist && lineData[dataCategory]}
                {#if lineData[dataCategory][`y${tick}`] && lineData[dataCategory][`y${tick}`].length > 0}
                <text class="font-bold"
                    transform={`translate(${xScale(tick) + xScale.bandwidth()/2}, 20)`}
                >{lineData[dataCategory][`y${tick}`][0].value}</text>
                {/if}
                {#each colorCategories as category, i}
                {#if lineData[dataCategory][category] && lineData[dataCategory][category][`y${tick}`] && lineData[dataCategory][category][`y${tick}`].length > 0}
                <text class="font-bold"
                    fill={colors[i]}
                    transform={`translate(${xScale(tick) + xScale.bandwidth()/2}, ${20 + (20 * i)})`}
                >{lineData[dataCategory][category][`y${tick}`][0].value}</text>                    
                {:else}
                {#if lineData[dataCategory][category][statusLegendEntry[category]]}
                    {#if lineData[dataCategory][category][statusLegendEntry[category]][`y${tick}`] &&
                        lineData[dataCategory][category][statusLegendEntry[category]][`y${tick}`].length > 0
                    }
                        <text class="font-bold"
                            fill={colors[i]}
                            transform={`translate(${xScale(tick) + xScale.bandwidth()/2}, ${20 + (20 * i)})`}
                        >{lineData[dataCategory][category][statusLegendEntry[category]][`y${tick}`][0].value}</text>                        
                    {/if}
                {/if}
                {/if} 
                {/each}
                {/if}
                {/each}
            </g>
            {#if colorCategories && colors && xScale && yScale && hoverset && metadata.nodesExist}
            <g transform={`translate(${margin.left},${margin.top})`}>
                <Lines 
                    {colorCategories}
                    {colors}
                    {xScale}
                    {yScale}
                    {years}
                    {statusLegendEntry}
                />
            </g>
            {/if}
            {#each years as year}
                {#if dataCategory === "status" && colorCategories.length}
                    {@const subScale = scaleBand().domain(colorCategories).range([0, xScale.bandwidth()])}
                    {@const categories = colorCategories.map(m => {
                        const val = dataset.get(m).get(year);
                        const row = val.entries().next().value[1][0]
                        if (row && typeof row === "object") {
                            const keys = Object.keys(row).filter(f => f !== "year" && f !== "facility_sk");
                            if (keys.length) {
                                return keys
                            } else { return []}
                        } else { return []}
                    })}
                    {#if categories.length}
                    {#each colorCategories as col, index}
                        <!-- {@const opacityScale = scaleLinear().domain([0, categories[index].length-1]).range([0.3,0.9])} -->
                        {@const dps = dataset?.get(col).get(year) as InternMap}
                        {#if dps && typeof dps === "object"}
                        {@const circles = Array.from(dps).flatMap(([key, value]) => {
                            const facility = facilities.find(f => f.facility_sk === key);
                            return categories[index].map((category, i) => {
                                const total = value.length && value.length === 1
                                    ? value[0][category]
                                    : value.reduce((acc, curr)=> acc + curr[category], 0)
                                return {
                                    Facility_Name: facility.Facility_Name,
                                    facility_sk: facility.facility_sk,
                                    year: year,
                                    value: total,
                                    id: `${facility.facility_sk}_${year}_${category}`,
                                    category: category,
                                    fill: colorScale(col),
                                    fillopacity: 0.4,
                                    y: yScale(total),
                                    display: statusLegendEntry[col] === category ? "block" : "none"
                                } as DataPoint})
                        })}
                        <g transform={`translate(${xScale(year)}, ${margin.top})`}>
                            <ScatterColumn
                                colStart={20 + (xScale.bandwidth()/2) + ((subScale.bandwidth()/2) * index)} 
                                yearData={circles.filter(f => f.value > 0)}
                                {yScale}
                                {radius}
                                hoverHandler={handleHover}
                                {hoverset}
                                {dataCategory}
                                {statusLegendEntry}
                                {year}
                                {col}
                            />
                        </g>
                        {/if}
                    {/each}
                    {/if}
                {:else if colorCategories.length}
                    {@const subScale = scaleBand().domain(colorCategories).range([0, xScale.bandwidth()])}
                    {#each colorCategories as category, index}
                        {@const dps = dataset?.get(year)}
                        {#if dps && typeof dps === "object"}
                        {@const circles = Array.from(dps).map(([key, value]) => {
                            const facility = facilities.find(f => f.facility_sk === key);
                            const total = typeof value === "number" && value
                                ? value 
                                : dataCategory === "location" && value.length
                                    ?  value[0][category]
                                    : dataCategory === "animalcategory"
                                        ? typeof value === "object"
                                            ? value.get(category)
                                            : 0 
                                        : 0
                                return {
                                    Facility_Name: facility.Facility_Name,
                                    facility_sk: facility.facility_sk,
                                    year: year,
                                    value: total,
                                    id: `${facility.facility_sk}_${year}_${category}`,
                                    category: category,
                                    fill: colorScale(category),
                                    fillopacity: hoverset ? .3 : .5,
                                    y: yScale(total),
                                    display: "block"
                                } as DataPoint;
                            })}
                        <g transform={`translate(${xScale(year)}, ${margin.top})`}>
                            <ScatterColumn
                                colStart={20 + (xScale.bandwidth()/2) + ((subScale.bandwidth()/2) * index)} 
                                yearData={circles.filter(f => f.value > 0)}
                                {yScale}
                                {radius}
                                hoverHandler={handleHover}
                                {statusLegendEntry}
                                {hoverset}
                                {dataCategory}
                                {year}
                                {category}
                            />
                        </g>                            
                        {/if}
                    {/each}
                {/if}
            {/each}
        </svg>
    {/if}
</div>
</div>
<style lang="scss">
    div#main {
        height: 95vh;
        display: flex;
        flex-wrap: wrap;
    }
    h2 {
        text-align: center;
    }
    g#yAxis line {
        stroke: #ddd;
        stroke-width: .5;
    }
    .tooltip {
        position: absolute;
        font-family: 'Poppins', sans-serif !important;
        min-width: 8em;
        line-height: 1.2;
        font-size: 0.875rem;
        z-index: 1;
        padding: 6px;
        transition:
        left 100ms ease,
        top 100ms ease;
    }

    .circle {
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        width: 10px;
        height: 10px;
        border: 1px solid #000;
        transition:
        left 300ms ease,
        top 300ms ease;
    }
    #legend.status {
        flex-direction: column;
    }
    #xAxis text {
        text-anchor: middle;
    }
</style>