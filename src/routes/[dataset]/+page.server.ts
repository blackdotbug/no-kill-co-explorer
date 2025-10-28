import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';


type Statistics = {
  key: number;
  statistic_sk: string;
  facility_sk: string;
  year: number;
  start_of_year_date: string;
  end_of_year_date: string;
  Facility_Name: string;
  animal_category: string;
  animal_type: string;
  start_of_year_in_shelter_count: number;
  start_of_year_in_foster_care_count: number;
  intake_stray: number;
  intake_relinquished: number;
  intake_in_state_transfer: number;
  intake_out_of_state_transfer: number;
  intake_other: number;
  outcome_adoption: number;
  outcome_return_to_owner: number;
  outcome_in_state_transfer: number;
  outcome_out_of_state_transfer: number;
  outcome_other: number;
  outcome_deaths: number;
  outcome_euthanasia: number;
  outcome_missing_or_stolen: number;
  end_of_year_in_shelter_count: number;
  end_of_year_in_foster_care_count: number;
}[];
type Facilities = {
  facility_sk: string;
  Facility_Name: string;
  account_name: string;
  address: string;
  city: string;
  county: string;
  dba: string;
  latitude: string;
  longitude: string;
  pacfa_license_number: string;
  region_polygon: string;
  state: string;
  zip_code: string;
}[]
type FacilityTotals = {
  startTotals: {
    facility_sk: string;
    year: number;
    fostertotal: number;
    sheltertotal: number;
  }[];
  endTotals: {
    facility_sk: string;
    year: number;
    fostertotal: number;
    sheltertotal: number;
  }[];
}
type StatusTotals = {
  intakeTotals: {
      facility_sk: string;
      year: number;
      in_state_transfer: number;
      other: number;
      out_of_state_transfer: number;
      relinquished: number;
      stray: number;
  }[],
  outcomeTotals: {
      facility_sk: string;
      year: number;
      adoption: number;
      deaths: number;
      euthanasia: number;
      in_state_transfer: number;
      missing_or_stolen: number;
      other: number;
      out_of_state_transfer: number;
      return_to_owner: number;
  }[];
}
type AnimalCategoryTotals = {
    facility_sk: string;
    year: number;
    animal_category: string;
    start_foster: number;
    start_shelter: number;
    end_foster: number;
    end_shelter: number;
    adoption: number;
    deaths: number;
    euthanasia: number;
    outcome_in_state_transfer: number;
    missing_or_stolen: number;
    outcome_other: number;
    outcome_out_of_state_transfer: number;
    return_to_owner: number;
    intake_in_state_transfer: number;
    intake_other: number;
    intake_out_of_state_transfer: number;
    relinquished: number;
    stray: number;
}[];
type ReturnData = {
  facilities: Facilities[] | [],
  dataset: AnimalCategoryTotals[] | StatusTotals | FacilityTotals | Statistics[] | []
}
export const load: PageServerLoad = async ({ params }) => {
  const returnData: ReturnData = {
    facilities: [],
    dataset: [],
  } 

  const { data: facilities, error: error2 } = await supabase.from('facilities')
    .select<'*', Facilities>()
  if (error2) {
    console.error('Error loading facilities:', error2.message);
  } else {
    returnData.facilities = facilities;
  }

  if (params.dataset === "starttotals" || params.dataset === "difference" || params.dataset === "location") {
    const { data: startTotals, error: error3 } = await supabase.from('starttotals')
      .select<'*'>()
    const { data: endTotals, error: error4 } = await supabase.from('endtotals')
      .select<'*'>()
    if (error4 || error3) {
      console.error('Error loading start or end totals:', error4?.message ?? error3?.message);
    } else {
      const facilityTotals: FacilityTotals = {startTotals: startTotals, endTotals: endTotals}
      returnData.dataset = facilityTotals
    }
  } else if (params.dataset === "animalcategory") {
    const { data: animalCategoryTotals, error: error7 } = await supabase.from('animalcategorytotals')
      .select<'*', AnimalCategoryTotals>()
    if (error7) {
      console.error('Error loading outcome totals:', error7.message);
    } else {
      returnData.dataset = animalCategoryTotals
    }
  } else if (params.dataset === "animaltype") {
    const { data: statistics, error: error1 } = await supabase.from('statistics')
      .select<'*', Statistics>()
    if (error1) {
      console.error('Error loading statistics:', error1.message);
    } else {
      returnData.dataset = statistics
    }
  } else {
  const { data: intakeTotals, error: error5 } = await supabase.from('intaketotals')
    .select<'*'>()
  const { data: outcomeTotals, error: error6 } = await supabase.from('outcometotals')
    .select<'*'>()
    if (error5 || error6) {
      console.error('Error loading start or end totals:', error5?.message ?? error6?.message);
    } else {
      const statusTotals: StatusTotals = {intakeTotals: intakeTotals, outcomeTotals: outcomeTotals};
      returnData.dataset = statusTotals;
    }
  }
  return returnData;
};