export const fetchScryfallData = async (query: string): Promise<string[]> => {
    if (!query) return []; // Return an empty array if query is empty
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
  
      if (data.status === 404 || !data.data) {
        // Return empty array if no cards are found
        return [];
      }
  
      // Map card names from API response
      return data.data
    } catch (error) {
      console.error("Error fetching cards from Scryfall:", error);
      return [];
    }
  };
  