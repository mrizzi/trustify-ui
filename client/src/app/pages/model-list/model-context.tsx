import React from "react";

import type { AxiosError } from "axios";

import {
  FILTER_TEXT_CATEGORY_KEY,
  TablePersistenceKeyPrefixes,
} from "@app/Constants";
import type { AiModelSummary } from "@app/client";
import { FilterType } from "@app/components/FilterToolbar";
import {
  type ITableControls,
  getHubRequestParams,
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";
import { useFetchAiModels } from "@app/queries/ai-models";

interface IModelSearchContext {
  tableControls: ITableControls<
    AiModelSummary,
    "name" | "supplier" | "license",
    "name",
    "",
    string
  >;

  totalItemCount: number;
  isFetching: boolean;
  fetchError: AxiosError | null;
}

const contextDefaultValue = {} as IModelSearchContext;

export const ModelSearchContext =
  React.createContext<IModelSearchContext>(contextDefaultValue);

interface IModelProvider {
  children: React.ReactNode;
}

export const ModelSearchProvider: React.FunctionComponent<IModelProvider> = ({
  children,
}) => {
  const tableControlState = useTableControlState({
    tableName: "model",
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.models,
    persistTo: "urlParams",
    columnNames: {
      name: "Name",
      supplier: "Supplied by",
      license: "License",
    },
    isPaginationEnabled: true,
    isSortEnabled: true,
    sortableColumns: ["name"],
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: FILTER_TEXT_CATEGORY_KEY,
        title: "Filter text",
        placeholderText: "Search",
        type: FilterType.search,
      },
    ],
    isExpansionEnabled: false,
  });

  const {
    result: { data: models, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchAiModels(
    getHubRequestParams({
      ...tableControlState,
      hubSortFieldKeys: {
        name: "name",
      },
    }),
  );

  const tableControls = useTableControlProps({
    ...tableControlState,
    idProperty: "nodeId",
    currentPageItems: models,
    totalItemCount,
    isLoading: isFetching,
  });

  return (
    <ModelSearchContext.Provider
      value={{ totalItemCount, isFetching, fetchError, tableControls }}
    >
      {children}
    </ModelSearchContext.Provider>
  );
};
