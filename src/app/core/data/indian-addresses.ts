// Indian States with major cities and sample pincodes
export interface City {
  name: string;
  pincodes: string[];
}

export interface State {
  name: string;
  cities: City[];
}

export const INDIAN_STATES: State[] = [
  {
    name: 'Gujarat',
    cities: [
      { name: 'Ahmedabad', pincodes: ['380001', '380002', '380003', '380004', '380005'] },
      { name: 'Surat', pincodes: ['395001', '395002', '395003', '395004', '395005'] },
      { name: 'Vadodara', pincodes: ['390001', '390002', '390003', '390004', '390005'] },
      { name: 'Rajkot', pincodes: ['360001', '360002', '360003', '360004', '360005'] },
      { name: 'Gandhinagar', pincodes: ['382010', '382011', '382012', '382013', '382014'] }
    ]
  },
  {
    name: 'Maharashtra',
    cities: [
      { name: 'Mumbai', pincodes: ['400001', '400002', '400003', '400004', '400005'] },
      { name: 'Pune', pincodes: ['411001', '411002', '411003', '411004', '411005'] },
      { name: 'Nagpur', pincodes: ['440001', '440002', '440003', '440004', '440005'] },
      { name: 'Nashik', pincodes: ['422001', '422002', '422003', '422004', '422005'] }
    ]
  },
  {
    name: 'Delhi',
    cities: [
      { name: 'New Delhi', pincodes: ['110001', '110002', '110003', '110004', '110005'] },
      { name: 'Delhi', pincodes: ['110006', '110007', '110008', '110009', '110010'] }
    ]
  },
  {
    name: 'Karnataka',
    cities: [
      { name: 'Bangalore', pincodes: ['560001', '560002', '560003', '560004', '560005'] },
      { name: 'Mysore', pincodes: ['570001', '570002', '570003', '570004', '570005'] },
      { name: 'Mangalore', pincodes: ['575001', '575002', '575003', '575004', '575005'] }
    ]
  },
  {
    name: 'Tamil Nadu',
    cities: [
      { name: 'Chennai', pincodes: ['600001', '600002', '600003', '600004', '600005'] },
      { name: 'Coimbatore', pincodes: ['641001', '641002', '641003', '641004', '641005'] },
      { name: 'Madurai', pincodes: ['625001', '625002', '625003', '625004', '625005'] }
    ]
  },
  {
    name: 'Rajasthan',
    cities: [
      { name: 'Jaipur', pincodes: ['302001', '302002', '302003', '302004', '302005'] },
      { name: 'Jodhpur', pincodes: ['342001', '342002', '342003', '342004', '342005'] },
      { name: 'Udaipur', pincodes: ['313001', '313002', '313003', '313004', '313005'] }
    ]
  },
  {
    name: 'Uttar Pradesh',
    cities: [
      { name: 'Lucknow', pincodes: ['226001', '226002', '226003', '226004', '226005'] },
      { name: 'Kanpur', pincodes: ['208001', '208002', '208003', '208004', '208005'] },
      { name: 'Agra', pincodes: ['282001', '282002', '282003', '282004', '282005'] }
    ]
  },
  {
    name: 'West Bengal',
    cities: [
      { name: 'Kolkata', pincodes: ['700001', '700002', '700003', '700004', '700005'] },
      { name: 'Howrah', pincodes: ['711101', '711102', '711103', '711104', '711105'] }
    ]
  },
  {
    name: 'Punjab',
    cities: [
      { name: 'Chandigarh', pincodes: ['160001', '160002', '160003', '160004', '160005'] },
      { name: 'Amritsar', pincodes: ['143001', '143002', '143003', '143004', '143005'] },
      { name: 'Ludhiana', pincodes: ['141001', '141002', '141003', '141004', '141005'] }
    ]
  },
  {
    name: 'Haryana',
    cities: [
      { name: 'Gurgaon', pincodes: ['122001', '122002', '122003', '122004', '122005'] },
      { name: 'Faridabad', pincodes: ['121001', '121002', '121003', '121004', '121005'] }
    ]
  },
  {
    name: 'Madhya Pradesh',
    cities: [
      { name: 'Bhopal', pincodes: ['462001', '462002', '462003', '462004', '462005'] },
      { name: 'Indore', pincodes: ['452001', '452002', '452003', '452004', '452005'] }
    ]
  },
  {
    name: 'Andhra Pradesh',
    cities: [
      { name: 'Hyderabad', pincodes: ['500001', '500002', '500003', '500004', '500005'] },
      { name: 'Vishakhapatnam', pincodes: ['530001', '530002', '530003', '530004', '530005'] }
    ]
  },
  {
    name: 'Kerala',
    cities: [
      { name: 'Kochi', pincodes: ['682001', '682002', '682003', '682004', '682005'] },
      { name: 'Thiruvananthapuram', pincodes: ['695001', '695002', '695003', '695004', '695005'] }
    ]
  }
];

export function getCitiesByState(stateName: string): City[] {
  const state = INDIAN_STATES.find(s => s.name === stateName);
  return state ? state.cities : [];
}

export function getPincodesByCity(stateName: string, cityName: string): string[] {
  const state = INDIAN_STATES.find(s => s.name === stateName);
  if (!state) return [];
  const city = state.cities.find(c => c.name === cityName);
  return city ? city.pincodes : [];
}

export function getStateNames(): string[] {
  return INDIAN_STATES.map(s => s.name);
}

