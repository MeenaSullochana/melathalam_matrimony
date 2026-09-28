/** Shared PHP-parity field maps for admin + matri profile forms */

export const MARITAL = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce']
export const YES_NO = ['Yes', 'No', "Don't Know"]
export const SMOKE_DRINK = ['No', 'Occasionally', 'Yes']
export const PHYSICAL = ['Normal', 'Physically Challenged']
export const FAMILY_TYPE = ['Joint', 'Nuclear']
export const FAMILY_STATUS = ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent']
export const FAMILY_VALUE = ['Orthodox', 'Traditional', 'Moderate', 'Liberal']
export const PROFILE_BY = ['Self', 'Parents', 'Sibling', 'Relative', 'Friend']

/** Partner preference keys matching PHP editprofile submit_form3 */
export const PARTNER_FIELDS = [
  ['looking_for', 'Looking for (marital)'],
  ['part_frm_age', 'Age from'],
  ['part_to_age', 'Age to'],
  ['part_height', 'Height from'],
  ['part_height_to', 'Height to'],
  ['part_physical', 'Physical status'],
  ['part_diet', 'Diet'],
  ['part_smoke', 'Smoke'],
  ['part_drink', 'Drink'],
  ['part_edu', 'Education'],
  ['part_income', 'Income / Monthly income'],
  ['part_occu', 'Occupation'],
  ['part_emp_in', 'Employed in'],
  ['part_religion', 'Religion'],
  ['part_caste', 'Caste'],
  ['part_subcaste', 'Sub caste'],
  ['part_mtongue', 'Mother tongue'],
  ['part_manglik', 'Manglik'],
  ['part_star', 'Star'],
  ['part_rasi', 'Rasi'],
  ['part_complexation', 'Complexion'],
  ['part_country_living', 'Country'],
  ['part_state', 'State'],
  ['part_city', 'City'],
  ['part_resi_status', 'Residential status'],
]

/** Core biodata keys matching PHP editprofile submit_form1 */
export const BIODATA_EXTRA = [
  ['tot_children', 'Total children'],
  ['status_children', 'Children living with'],
  ['will_to_mary_caste', 'Willing to marry from'],
  ['hobby', 'Hobby'],
  ['language_known', 'Languages known'],
  ['land_property', 'Land / property'],
  ['income', 'Monthly / Annual income'],
]

export const emptyPartnerFields = () =>
  Object.fromEntries([
    ...PARTNER_FIELDS.map(([k]) => [k, '']),
    ['part_expect', ''],
    ['part_expect_approve', ''],
    ['part_dosh', ''],
  ])
