import React, { useState, useEffect, useRef } from "react";
import styles from "./AutoComplete.module.css";
import { AutoCompleteProps } from "./AutoComplete.types";
import { useDebounce } from "../../hooks/useDebounce";

const AutoComplete: React.FC<AutoCompleteProps> = ({
  fetchData,
  onSelect,
  placeholder = "Search...",
  debounceDelay = 300,
  minQueryLength = 1,
  renderSuggestion,
  ariaLabel = "autocomplete",
  defaultValue = "",
}) => {
  const [query, setQuery] = useState<string>(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastQueryRef = useRef<string>("");

  const fetchSuggestions = useDebounce(async (searchQuery: string) => {
    if (lastQueryRef.current === searchQuery) return; // skip duplicate fetch
    lastQueryRef.current = searchQuery;

    setLoading(true);
    try {
      const data = await fetchData(searchQuery);
      setSuggestions(data?.length > 0 ? data : ["No items available"]); 
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, debounceDelay);

  useEffect(() => {
    if (query.length >= minQueryLength || query.length === 0) {
      fetchSuggestions(query);
    }
  }, [query, fetchSuggestions, minQueryLength]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150); // delay hiding to allow click on suggestions
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion !== "No items available" ? suggestion : ""); // ignore "No items available" as a valid selection
    setShowSuggestions(false);
    if (onSelect && suggestion !== "No items available") {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleClearInput = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (onSelect) {
      onSelect(""); 
    }
  };

  const highlightText = (text: string, query: string): JSX.Element[] => {
    if (text === "No items available") {
      // return text without highlighting
      return [<React.Fragment key="no-items">{text}</React.Fragment>];
    }
  
    const regex = new RegExp(`(${query})`, "i"); // i makes this case Insensitive
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className={styles.highlight}>
          {part}
        </span>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };
  

  return (
    <div className={styles.autoComplete}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          ref={inputRef}
          className={`${styles.input} ${loading ? styles.loading : ""}`}
          aria-label={ariaLabel}
        />
        <div className={styles.iconWrapper}>
          {loading ? (
            <div className={styles.spinner} role="status"></div>
          ) : query ? (
            <button
              className={styles.clearButton}
              onClick={handleClearInput}
              aria-label="Clear input"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
      {showSuggestions && (
        <ul className={styles.suggestions} role="listbox">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`${styles.suggestion} ${
                index === highlightedIndex ? styles.active : ""
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {renderSuggestion
                ? renderSuggestion(suggestion)
                : highlightText(suggestion, query)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;
