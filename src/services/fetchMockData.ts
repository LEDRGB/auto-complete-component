import { mockData } from "./mocks/autoCompleteMockData";

export const fetchMockData = async (query: string): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData.filter((item) => item.toLowerCase().includes(query.toLowerCase())));
      }, 300); // Simulate network delay
    });
  };
  