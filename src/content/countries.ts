export interface CountryDefinition {
  id: string;
  name: string;
  currency: string;
  defaultLifeExpectancy: number;
}

export const COUNTRIES: CountryDefinition[] = [
  {
    id: "IND",
    name: "India",
    currency: "INR",
    defaultLifeExpectancy: 70,
  },
  {
    id: "USA",
    name: "United States",
    currency: "USD",
    defaultLifeExpectancy: 79,
  },
];