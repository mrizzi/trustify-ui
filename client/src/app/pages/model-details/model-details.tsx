import type React from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Label,
  PageSection,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";

import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { useFetchAiModelById } from "@app/queries/ai-models";
import { PathParam, Paths, useRouteParams } from "@app/Routes";

interface ExternalReference {
  url: string;
  type?: string;
  comment?: string;
}

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

export const ModelDetails: React.FC = () => {
  const sbomId = useRouteParams(PathParam.SBOM_ID);
  const modelId = useRouteParams(PathParam.MODEL_ID);
  const { aiModel, isFetching, fetchError } = useFetchAiModelById(
    sbomId,
    modelId,
  );

  const externalRefs = (aiModel?.externalReferences ??
    []) as ExternalReference[];

  return (
    <>
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={Paths.models}>Models</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Model details</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection>
        <Split>
          <SplitItem isFilled>
            <Content>
              <Content component="h1">{aiModel?.name ?? modelId ?? ""}</Content>
            </Content>
          </SplitItem>
          <SplitItem>
            {aiModel && (
              <Button
                variant="primary"
                icon={<DownloadIcon />}
                component="a"
                href={`/api/v2/sbom/${aiModel.sbomId}/download`}
                download
              >
                Download
              </Button>
            )}
          </SplitItem>
        </Split>
      </PageSection>
      <PageSection>
        <LoadingWrapper isFetching={isFetching} fetchError={fetchError}>
          {aiModel && (
            <Grid hasGutter>
              <GridItem md={4}>
                <Card isFullHeight>
                  <CardTitle>Identity & Purpose</CardTitle>
                  <CardBody>
                    <DescriptionList>
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
              </GridItem>
              <GridItem md={4}>
                <Card isFullHeight>
                  <CardTitle>SBOM Metadata</CardTitle>
                  <CardBody>
                    <DescriptionList>
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
              </GridItem>
              {externalRefs.length > 0 && (
                <GridItem md={4}>
                  <Card isFullHeight>
                    <CardTitle>External References</CardTitle>
                    <CardBody>
                      <DescriptionList>
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
                </GridItem>
              )}
            </Grid>
          )}
        </LoadingWrapper>
      </PageSection>
    </>
  );
};
