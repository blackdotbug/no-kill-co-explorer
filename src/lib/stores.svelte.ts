import type { SimulationNodeDatum } from "d3-force";
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

const years = ["y2015", "y2016", "y2017", "y2018", "y2019", "y2020", "y2021", "y2022", "y2023", "y2024"]

export const metadata = $state({
    currentpage: "",
    nodesExist: false
})

export const lineData = $state({
    starttotals: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
    status: {
        intake: {
            in_state_transfer: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            other: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            out_of_state_transfer: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            relinquished: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            stray: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]]))
        },
        outcome: {
            adoption: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            deaths: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            euthanasia: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            in_state_transfer: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            missing_or_stolen: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            other: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            out_of_state_transfer: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
            return_to_owner: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]]))
        }
    },
    location: {
        sheltertotal: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
        fostertotal: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
    },
    animalcategory: {
        dog: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
        cat: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
        other: years.map(m => Object.fromEntries<DataPoint[]>([[m, []]])),
    }
}
)