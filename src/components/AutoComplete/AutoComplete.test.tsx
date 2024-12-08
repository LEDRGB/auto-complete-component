import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AutoComplete from "./AutoComplete";

describe("AutoComplete Component", () => {
  const mockFetchData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders input with placeholder", () => {
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
  });

  test("fetches suggestions on valid input", async () => {
    mockFetchData.mockResolvedValue(["Apple", "Banana", "Cherry"]);
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    await waitFor(() => expect(mockFetchData).toHaveBeenCalledWith("a"));
  });

  test("displays suggestions", async () => {
    mockFetchData.mockResolvedValue(["Apple", "Banana", "Cherry"]);
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestions = screen.getAllByRole("option");
      expect(suggestions).toHaveLength(3);
    });
  });

  test("clears input when clear button is clicked", async () => {
    mockFetchData.mockResolvedValue(["Apple", "Banana"]);
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });

    const clearButton = await screen.findByLabelText("Clear input");
    fireEvent.click(clearButton);

    expect(input).toHaveValue("");
    expect(mockFetchData).toHaveBeenCalledTimes(1);
  });

  test("does not fetch suggestions for input below minQueryLength", async () => {
    render(<AutoComplete fetchData={mockFetchData} minQueryLength={3} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "ap" } });

    await waitFor(() => {
      expect(mockFetchData).not.toHaveBeenCalled();
    });
  });

  test("shows 'No items available' when no suggestions are found", async () => {
    mockFetchData.mockResolvedValue([]);
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "z" } });
    fireEvent.focus(input);

    await waitFor(() => {
      const noSuggestions = screen.getByText("No items available");
      expect(noSuggestions).toBeInTheDocument();
    });
  });

  test("highlights suggestion with keyboard navigation", async () => {
    mockFetchData.mockResolvedValue(["Apple", "Banana", "Cherry"]);
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestions = screen.getAllByRole("option");
      expect(suggestions).toHaveLength(3);
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const activeSuggestion = screen.getAllByRole("option")[0];
      expect(activeSuggestion).toHaveClass("active");
    });
  });

  test("selects a suggestion on Enter key press", async () => {
    const onSelectMock = jest.fn();
    mockFetchData.mockResolvedValue(["Apple", "Banana", "Cherry"]);
    render(<AutoComplete fetchData={mockFetchData} onSelect={onSelectMock} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestions = screen.getAllByRole("option");
      expect(suggestions).toHaveLength(3);
    });

    fireEvent.keyDown(input, { key: "ArrowDown" }); 
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectMock).toHaveBeenCalledWith("Apple");
    expect(input).toHaveValue("Apple");
  });

  test("closes suggestions when Escape is pressed", async () => {
    mockFetchData.mockResolvedValue(["Apple", "Banana"]);
    render(<AutoComplete fetchData={mockFetchData} debounceDelay={0} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestions = screen.getAllByRole("option");
      expect(suggestions).toHaveLength(2);
    });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("renders custom suggestion template", async () => {
    mockFetchData.mockResolvedValue(["Apple", "Banana", "Cherry"]);
    const renderSuggestion = (item: string) => <strong>{item}</strong>;

    render(
      <AutoComplete
        fetchData={mockFetchData}
        renderSuggestion={renderSuggestion}
        debounceDelay={0}
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestion = screen.getByText("Apple");
      expect(suggestion).toContainHTML("<strong>Apple</strong>");
    });
  });
});
