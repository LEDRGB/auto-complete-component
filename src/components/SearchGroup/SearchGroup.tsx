import React from "react";
import styles from "./SearchGroup.module.css";
import { fetchScryfallData } from "../../services/fetchScryfallData";
import AutoComplete from "../AutoComplete/AutoComplete";
import { fetchMockData } from "../../services/fetchMockData";

const SearchGroup: React.FC = () => {
  const handleSelect = (value: string, source: string) => {
    //just to log the data for this task
    console.log(`Selected in ${source} search:`, value);
  };

  return (
    <div className={styles.searchGroup}>
      <h2 className={styles.mainTitle}>Responsive AutoComplete Search</h2>
      <div className={styles.searchContainer}>
        <h3 className={styles.title}>Mock Data Search</h3>
        <AutoComplete
          fetchData={fetchMockData}
          onSelect={(value) => handleSelect(value, "Mock Data")}
          placeholder="Search Mock Data..."
          noSuggestionsText="Nothing to show!"
          clearOnSelect={true}
          minQueryLength={2}
        />
      </div>
      <div className={styles.searchContainer}>
        <h3 className={styles.title}>Scryfall Card Search</h3>
        <AutoComplete
          fetchData={fetchScryfallData}
          onSelect={(value) => handleSelect(value, "Scryfall")}
          placeholder="Search Cards..."
          noSuggestionsText="No cards found!"
          clearOnSelect={true}
          minQueryLength={2}          
        />
      </div>
    </div>
  );
};

export default SearchGroup;
