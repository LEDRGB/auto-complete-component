export interface AutoCompleteProps {
  fetchData: (query: string) => Promise<string[]>;
  onSelect?: (value: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  minQueryLength?: number;
  renderSuggestion?: (suggestion: string) => React.ReactNode;
  noSuggestionsText?: string;
  ariaLabel?: string;
  defaultValue?: string;
  clearOnSelect?: boolean;
}
