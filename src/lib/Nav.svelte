<script lang="ts">
    const { dataset } = $props();
    $inspect("nav", dataset)
    const menu = [
        {href: "", text: "No Kill Colorado Data Explorer"},
        {href: "starttotals", text: "Start of Year Totals"},
        {href: "location", text: "Start of Year by Location"},
        {href: "status", text: "Intake vs. Outcome"},
        {href: "animalcategory", text: "Start of Year by Animal Category"}
    ]
</script>
<div class="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
    <ul class="flex flex-wrap -mb-px">
        {#each menu as item}
        <li class="me-2">
            <a href={`/${item.href}`} 
                class={  
                dataset === item.href || (!dataset && item.href === "")
                    ? `inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500`
                    : `inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`}>
                {item.text}
            </a>
        </li>            
        {/each}
    </ul>
</div>
