import * as React from "react";

import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";

import type { ISearchFilterCategory } from "../FilterToolbar";
import type { IFilterControlProps } from "./FilterControl";

export interface ISearchFilterControlProps<
  TItem,
  TFilterCategoryKey extends string,
> extends IFilterControlProps<TItem, TFilterCategoryKey> {
  category: ISearchFilterCategory<TItem, TFilterCategoryKey>;
  isNumeric: boolean;
}

export const SearchFilterControl = <TItem, TFilterCategoryKey extends string>({
  category,
  filterValue,
  setFilterValue,
  isNumeric,
  isDisabled = false,
}: React.PropsWithChildren<
  ISearchFilterControlProps<TItem, TFilterCategoryKey>
>): React.JSX.Element | null => {
  // Keep internal copy of value until submitted by user
  const [inputValue, setInputValue] = React.useState(filterValue?.[0] || "");
  // Update it if it changes externally
  React.useEffect(() => {
    setInputValue(filterValue?.[0] || "");
  }, [filterValue]);

  const onFilterSubmit = () => {
    const trimmedValue = inputValue.trim();
    setFilterValue(trimmedValue ? [trimmedValue.replace(/\s+/g, " ")] : []);
  };

  const id = `${category.categoryKey}-input`;

  return (
    <InputGroup>
      <TextInput
        name={id}
        type={isNumeric ? "number" : "search"}
        onChange={(_, value) => setInputValue(value)}
        aria-label={`${category.title} filter`}
        value={inputValue}
        placeholder={category.placeholderText}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key && event.key !== "Enter") return;
          onFilterSubmit();
        }}
        isDisabled={isDisabled}
      />
      <Button
        icon={<SearchIcon />}
        variant={ButtonVariant.control}
        aria-label="search button for search input"
        onClick={onFilterSubmit}
        isDisabled={isDisabled}
      />
    </InputGroup>
  );
};
