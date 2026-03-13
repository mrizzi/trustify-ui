import type React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";

import type { AiModelDetails } from "@app/client";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import type { AxiosError } from "axios";

interface AiModelDetailDrawerProps {
  aiModel: AiModelDetails | undefined;
  isFetching: boolean;
  fetchError: AxiosError | null;
  onClose: () => void;
}

interface ExternalReference {
  url: string;
  type?: string;
  comment?: string;
}

export const AiModelDetailDrawer: React.FC<AiModelDetailDrawerProps> = ({
  aiModel,
  isFetching,
  fetchError,
  onClose,
}) => {
  const externalRefs = (aiModel?.externalReferences ??
    []) as ExternalReference[];

  const labelForRefType = (type?: string): string => {
    switch (type) {
      case "website":
        return "Website";
      case "distribution":
        return "Distribution";
      case "other":
        return "LLM Analysis Report";
      default:
        return type ?? "Link";
    }
  };

  return (
    <DrawerPanelContent minSize="400px" maxSize="500px">
      <DrawerHead>
        <span>{aiModel?.name ?? ""}</span>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <LoadingWrapper isFetching={isFetching} fetchError={fetchError}>
          {aiModel && (
            <Stack hasGutter>
              <StackItem>
                <Card isCompact>
                  <CardTitle>Identity & Purpose</CardTitle>
                  <CardBody>
                    <DescriptionList isCompact isHorizontal>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Model type</DescriptionListTerm>
                        <DescriptionListDescription>
                          {aiModel.modelType ?? "-"}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          Primary purpose
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {aiModel.primaryTask ? (
                            <Label color="blue">{aiModel.primaryTask}</Label>
                          ) : (
                            "-"
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>License</DescriptionListTerm>
                        <DescriptionListDescription>
                          {aiModel.license ?? "-"}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Supplied by</DescriptionListTerm>
                        <DescriptionListDescription>
                          {aiModel.supplier ?? "-"}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </StackItem>

              <StackItem>
                <Card isCompact>
                  <CardTitle>SBOM Metadata</CardTitle>
                  <CardBody>
                    <DescriptionList isCompact isHorizontal>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Document ID</DescriptionListTerm>
                        <DescriptionListDescription>
                          {aiModel.sbomDocumentId ?? "-"}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Authors</DescriptionListTerm>
                        <DescriptionListDescription>
                          {aiModel.sbomAuthors.length > 0
                            ? aiModel.sbomAuthors.join(", ")
                            : "-"}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </StackItem>

              {externalRefs.length > 0 && (
                <StackItem>
                  <Card isCompact>
                    <CardTitle>External References</CardTitle>
                    <CardBody>
                      <DescriptionList isCompact isHorizontal>
                        {externalRefs.map((ref) => (
                          <DescriptionListGroup key={ref.url}>
                            <DescriptionListTerm>
                              {labelForRefType(ref.type)}
                            </DescriptionListTerm>
                            <DescriptionListDescription>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {ref.comment || ref.url} <ExternalLinkAltIcon />
                              </a>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        ))}
                      </DescriptionList>
                    </CardBody>
                  </Card>
                </StackItem>
              )}

              <StackItem>
                <Button
                  variant="secondary"
                  icon={<DownloadIcon />}
                  component="a"
                  href={`/api/v2/sbom/${aiModel.sbomId}/download`}
                  download
                >
                  Download
                </Button>
              </StackItem>
            </Stack>
          )}
        </LoadingWrapper>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};
