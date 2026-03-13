import React from "react";

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import {
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";
import { getHubRequestParams } from "@app/hooks/table-controls";
import {
  useFetchAiModelDetails,
  useFetchSbomAiModels,
} from "@app/queries/sboms";
import { FILTER_TEXT_CATEGORY_KEY } from "@app/Constants";

import { AiModelDetailDrawer } from "./components/AiModelDetailDrawer";

interface AiModelsBySbomProps {
  sbomId: string;
}

export const AiModelsBySbom: React.FC<AiModelsBySbomProps> = ({ sbomId }) => {
  const [selectedModel, setSelectedModel] = React.useState<{
    sbomId: string;
    nodeId: string;
  } | null>(null);

  const tableControlState = useTableControlState({
    tableName: "ai-models-table",
    columnNames: {
      name: "Name",
      supplier: "Supplier",
      license: "License",
      primaryTask: "Primary task",
      modelType: "Model type",
    },
    isSortEnabled: true,
    sortableColumns: ["name"],
    isPaginationEnabled: true,
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: FILTER_TEXT_CATEGORY_KEY,
        title: "Filter text",
        placeholderText: "Search",
        type: FilterType.search,
      },
    ],
  });

  const {
    result: { data: aiModels, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchSbomAiModels(
    sbomId,
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
    currentPageItems: aiModels,
    totalItemCount,
    isLoading: isFetching,
  });

  const {
    currentPageItems,
    numRenderedColumns,
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
  } = tableControls;

  const {
    aiModel,
    isFetching: isFetchingDetails,
    fetchError: detailsError,
  } = useFetchAiModelDetails(
    selectedModel?.sbomId ?? "",
    selectedModel?.nodeId ?? "",
  );

  const drawerContent = (
    <>
      <Toolbar {...toolbarProps} aria-label="AI models toolbar">
        <ToolbarContent>
          <FilterToolbar {...filterToolbarProps} />
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="ai-models-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table {...tableProps} aria-label="AI models table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "supplier" })} />
              <Th {...getThProps({ columnKey: "license" })} />
              <Th {...getThProps({ columnKey: "primaryTask" })} />
              <Th {...getThProps({ columnKey: "modelType" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={totalItemCount === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems.map((item, rowIndex) => (
            <Tbody key={item.nodeId}>
              <Tr {...getTrProps({ item })}>
                <TableRowContentWithControls
                  {...tableControls}
                  item={item}
                  rowIndex={rowIndex}
                >
                  <Td width={25} {...getTdProps({ columnKey: "name" })}>
                    <Button
                      variant="link"
                      isInline
                      onClick={() =>
                        setSelectedModel({
                          sbomId: item.sbomId,
                          nodeId: item.nodeId,
                        })
                      }
                    >
                      {item.name}
                    </Button>
                  </Td>
                  <Td width={20} {...getTdProps({ columnKey: "supplier" })}>
                    {item.supplier ?? "-"}
                  </Td>
                  <Td width={20} {...getTdProps({ columnKey: "license" })}>
                    {item.license ?? "-"}
                  </Td>
                  <Td width={15} {...getTdProps({ columnKey: "primaryTask" })}>
                    {item.primaryTask ? (
                      <Label color="blue">{item.primaryTask}</Label>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td width={20} {...getTdProps({ columnKey: "modelType" })}>
                    {item.modelType ?? "-"}
                  </Td>
                </TableRowContentWithControls>
              </Tr>
            </Tbody>
          ))}
        </ConditionalTableBody>
      </Table>

      <SimplePagination
        idPrefix="ai-models-table"
        isTop={false}
        paginationProps={paginationProps}
      />
    </>
  );

  return (
    <Drawer isExpanded={selectedModel !== null} onExpand={() => {}}>
      <DrawerContent
        panelContent={
          selectedModel && (
            <AiModelDetailDrawer
              aiModel={aiModel}
              isFetching={isFetchingDetails}
              fetchError={detailsError}
              onClose={() => setSelectedModel(null)}
            />
          )
        }
      >
        <DrawerContentBody>{drawerContent}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
