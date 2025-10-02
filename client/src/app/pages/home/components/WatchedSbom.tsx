import React from "react";
import { generatePath, Link } from "react-router-dom";

import { useIsMutating } from "@tanstack/react-query";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from "@patternfly/react-core";
import TimesIcon from "@patternfly/react-icons/dist/esm/icons/times-icon";
import text from "@patternfly/react-styles/css/utilities/Text/text";

import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { useFetchSBOMById, useFetchSBOMs } from "@app/queries/sboms";
import { Paths } from "@app/Routes";

import { WatchedSbomsContext } from "../watched-sboms-context";
import { WatchedSbomDonutChart } from "./WatchedSbomDonutChart";

interface WatchedSbomProps {
  fieldName: string;
  sbomId: string | null;
}

const defaultDebounce = 500;

export const WatchedSbom: React.FC<WatchedSbomProps> = ({
  fieldName,
  sbomId,
}) => {
  const { patch } = React.useContext(WatchedSbomsContext);

  const textInputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState<string>("");
  const [debouncedInputValue, setDebouncedInputValue] = React.useState("");

  React.useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, defaultDebounce);
    return () => clearTimeout(delayInputTimeoutId);
  }, [inputValue]);

  const [isSelectOpen, setIsSelectOpen] = React.useState(false);

  const {
    sbom: currentSbom,
    isFetching: isFetchingCurrentSbom,
    fetchError: fetchErrorCurrentSbom,
  } = useFetchSBOMById(sbomId ?? undefined, undefined, 1);

  // Handle SBOMs that no longer exist

  const assumeSbomWasDeleted = React.useMemo(() => {
    return fetchErrorCurrentSbom?.response?.status === 404;
  }, [fetchErrorCurrentSbom]);

  const isMutating = useIsMutating();

  React.useEffect(() => {
    if (assumeSbomWasDeleted) {
      patch(fieldName, null);
    }
  }, [fieldName, assumeSbomWasDeleted, patch]);

  // Dropdown

  const {
    result: { data: sbomOptions },
  } = useFetchSBOMs({
    filters: [{ field: "", operator: "~", value: debouncedInputValue }],
    page: { pageNumber: 1, itemsPerPage: 10 },
    sort: { field: "ingested", direction: "desc" },
  });

  const onSelectItem = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value) {
      patch(fieldName, value as string);
    }

    closeMenu();
  };

  const closeMenu = () => {
    setIsSelectOpen(false);
  };

  const onToggleClick = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  const onInputClick = () => {
    if (!isSelectOpen) {
      setIsSelectOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
  };

  const onClearButtonClick = () => {
    setInputValue("");
    textInputRef?.current?.focus();
  };

  return (
    <Card isFullHeight>
      <LoadingWrapper
        isFetching={
          isFetchingCurrentSbom || assumeSbomWasDeleted || isMutating > 0
        }
        fetchError={fetchErrorCurrentSbom}
      >
        {currentSbom && (
          <CardTitle className={text.textBreakWord}>
            {currentSbom?.name}
          </CardTitle>
        )}
        <CardBody>
          {sbomId ? (
            <Stack>
              <StackItem isFilled>
                <WatchedSbomDonutChart sbomId={sbomId} />
              </StackItem>
              <StackItem>
                <Link to={generatePath(Paths.sbomDetails, { sbomId })}>
                  View Details
                </Link>
              </StackItem>
            </Stack>
          ) : (
            <EmptyState
              headingLevel="h4"
              titleText="There is nothing here yet"
              variant={EmptyStateVariant.xs}
            >
              <EmptyStateBody>
                You can get started by uploading an SBOM. Once your SBOMs are
                uploaded come back to this page to change the SBOMs you would
                like to track.
              </EmptyStateBody>
            </EmptyState>
          )}
        </CardBody>
      </LoadingWrapper>
      <CardFooter>
        <Select
          shouldFocusFirstItemOnOpen={false}
          isOpen={isSelectOpen}
          onSelect={onSelectItem}
          onOpenChange={(isOpen) => {
            !isOpen && closeMenu();
          }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              variant="typeahead"
              onClick={onToggleClick}
              isExpanded={isSelectOpen}
              isFullWidth
            >
              <TextInputGroup isPlain>
                <TextInputGroupMain
                  autoComplete="off"
                  value={inputValue}
                  onClick={onInputClick}
                  onChange={onTextInputChange}
                  innerRef={textInputRef}
                  isExpanded={isSelectOpen}
                  placeholder="Select a new SBOM to watch"
                />

                <TextInputGroupUtilities
                  {...(!inputValue ? { style: { display: "none" } } : {})}
                >
                  <Button
                    icon={<TimesIcon aria-hidden />}
                    variant="plain"
                    onClick={onClearButtonClick}
                    aria-label="Clear input value"
                  />
                </TextInputGroupUtilities>
              </TextInputGroup>
            </MenuToggle>
          )}
        >
          <SelectList>
            {sbomOptions.map((option) => (
              <SelectOption key={option.id} value={option.id}>
                {option.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </CardFooter>
    </Card>
  );
};
