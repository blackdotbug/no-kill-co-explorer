<script>
    import { line } from "d3-shape";
    import { lineData, metadata } from "./stores.svelte";
    const { colorCategories, colors, xScale, yScale, years, statusLegendEntry } = $props();
    const minY = 0.8
    function trimUndefined(rows) {
        const sliceI = rows.findIndex(f => f.y !== yScale(minY));
        const trimmed = rows.slice(sliceI);
        while (trimmed.length > 0 && trimmed[trimmed.length -1].y === yScale(minY)) {
                trimmed.pop();
        }
        return trimmed
    }
    const pageData = $derived(lineData[metadata.currentpage])
    const linesProcessed = $derived.by(() => {
        if (pageData && metadata.nodesExist) {
        if (metadata.currentpage === "starttotals") {
            const datapoints = years.map(year => {
                let point = {year: year, x: xScale(year) + (xScale.bandwidth()/2) + 20, y: yScale(minY)};
                if (pageData[`y${year}`] && pageData[`y${year}`].length > 0) {
                    if (pageData[`y${year}`][0].x && pageData[`y${year}`][0].y) {
                        point = {year: year, x: pageData[`y${year}`][0].x + xScale(year), y: pageData[`y${year}`][0].y};
                    }
                }
                return point;
            })
            return [{'data': trimUndefined(datapoints)}];
        } else if (metadata.currentpage === "location" || metadata.currentpage === "animalcategory") {
            return colorCategories.map(category => {
                const categoryData = pageData[category]
                const yearData = years.map(year => {
                    let point = {
                        year: year, 
                        x: xScale(year) + (xScale.bandwidth()/2) + 20, 
                        y: yScale(minY)
                    };
                    if (categoryData && categoryData[`y${year}`] && categoryData[`y${year}`].length > 0) {
                        if (categoryData[`y${year}`][0].x && categoryData[`y${year}`][0].y) {
                            point = {
                                year: year, 
                                x: categoryData[`y${year}`][0].x + xScale(year), 
                                y: categoryData[`y${year}`][0].y
                            };
                        }
                    }
                    return point;
                })
                return {category: category, data: trimUndefined(yearData)}
            })
        } else if (metadata.currentpage === "status") {
            return colorCategories.map(category => {
                const categoryData = pageData[category];
                const subcatData = categoryData ? categoryData[statusLegendEntry[category]] : undefined;
                const yearData = years.map(year => {
                    let point = {
                        year: year, 
                        x: xScale(year) + (xScale.bandwidth()/2) + 20, 
                        y: yScale(minY)
                    };
                    if (subcatData && subcatData[`y${year}`] && subcatData[`y${year}`].length > 0) {
                        if (subcatData[`y${year}`][0].x && subcatData[`y${year}`][0].y) {
                            point = {
                                year: year, 
                                x: subcatData[`y${year}`][0].x + xScale(year), 
                                y: subcatData[`y${year}`][0].y
                            };
                        }
                    }
                    return point;
                })
                return {category: category, data: trimUndefined(yearData)}
            })
        }
    }            
    })
    const pathGen = $derived(line().x(d => d.x).y(d => d.y));
    const pathD = $derived(linesProcessed?.length > 0 ? linesProcessed.map(cd => {
            return cd.data ? pathGen(cd.data) : undefined
        }) : null);
</script>

<g transform={`translate(-20,0)`}>
    {#each pathD as d,i}
        <path d={d} stroke={metadata.currentpage === "starttotals" ? "black" : colors[i]} fill="none"/>        
    {/each}
</g>
