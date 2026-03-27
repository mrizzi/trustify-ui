import React from "react";

import type { AxiosError, AxiosPromise, AxiosRequestConfig } from "axios";
import type { FileRejection } from "react-dropzone";

import {
  Content,
  type DropEvent,
  HelperText,
  HelperTextItem,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalHeader,
  MultipleFileUpload,
  MultipleFileUploadMain,
  MultipleFileUploadStatus,
  MultipleFileUploadStatusItem,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import FileIcon from "@patternfly/react-icons/dist/esm/icons/file-code-icon";
import UploadIcon from "@patternfly/react-icons/dist/esm/icons/upload-icon";

import { useUpload } from "@app/hooks/useUpload";

export interface AssessmentCategory {
  key: string;
  name: string;
  description: string;
}

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    key: "sar",
    name: "Security Architecture Review (SAR)",
    description:
      "A Security Architecture Review evaluates the design and structure of a system to identify potential security weaknesses. It examines how security controls are integrated into the overall architecture.",
  },
  {
    key: "threat-model",
    name: "Threat Model",
    description:
      "Threat modeling identifies potential threats and vulnerabilities in a system by analyzing its architecture, data flows, and trust boundaries. It helps prioritize security efforts based on risk.",
  },
  {
    key: "pt",
    name: "Pentesting (PT)",
    description:
      "Penetration testing simulates real-world attacks to discover exploitable vulnerabilities. It validates the effectiveness of security controls through hands-on testing.",
  },
  {
    key: "sast",
    name: "Static Application Security Testing (SAST)",
    description:
      "SAST analyzes source code or binaries without executing them to find security vulnerabilities. It identifies coding flaws such as injection vulnerabilities, buffer overflows, and insecure configurations.",
  },
  {
    key: "dast",
    name: "Dynamic Application Security Testing (DAST)",
    description:
      "DAST tests a running application by sending requests and analyzing responses to find security vulnerabilities. It identifies issues like cross-site scripting, authentication problems, and server misconfigurations.",
  },
  {
    key: "vex",
    name: "Vulnerability Exploitability Exchange (VEX)",
    description:
      "VEX documents communicate the exploitability status of vulnerabilities in a product. They help consumers understand whether a known vulnerability actually affects a specific product version.",
  },
];

interface AssessmentCategoryStepProps {
  category: AssessmentCategory;
  uploadFn: (formData: FormData, config: AxiosRequestConfig) => AxiosPromise;
  onUploadSuccess: () => void;
}

export const AssessmentCategoryStep: React.FC<AssessmentCategoryStepProps> = ({
  category,
  uploadFn,
  onUploadSuccess,
}) => {
  const { uploads, handleUpload, handleRemoveUpload } = useUpload({
    parallel: false,
    uploadFn,
    onSuccess: onUploadSuccess,
  });

  const [showStatus, setShowStatus] = React.useState(false);
  const [statusIcon, setStatusIcon] = React.useState<
    "danger" | "success" | "inProgress"
  >("inProgress");
  const [rejectedFiles, setRejectedFiles] = React.useState<FileRejection[]>([]);

  if (!showStatus && uploads.size > 0) {
    setShowStatus(true);
  }

  React.useEffect(() => {
    const currentUploads = Array.from(uploads.values());
    if (currentUploads.some((e) => e.status === "inProgress")) {
      setStatusIcon("inProgress");
    } else if (currentUploads.every((e) => e.status === "complete")) {
      setStatusIcon("success");
    } else {
      setStatusIcon("danger");
    }
  }, [uploads]);

  const handleFileDrop = (_event: DropEvent, droppedFiles: File[]) => {
    handleUpload(droppedFiles);
  };

  const handleDropRejected = (fileRejections: FileRejection[]) => {
    setRejectedFiles(fileRejections);
  };

  const successFileCount = Array.from(uploads.values()).filter(
    (upload) => upload.response,
  ).length;

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component="h2">{category.name}</Content>
        <Content component="p">{category.description}</Content>
      </StackItem>
      <StackItem isFilled>
        <MultipleFileUpload
          onFileDrop={handleFileDrop}
          dropzoneProps={{
            accept: { "application/pdf": [".pdf"] },
            onDropRejected: handleDropRejected,
            useFsAccessApi: false,
          }}
          aria-label={`${category.key}-uploader`}
        >
          <MultipleFileUploadMain
            titleIcon={<UploadIcon />}
            titleText="Drag and drop files here"
            titleTextSeparator="or"
            infoText="Accepted file types: .pdf"
          />
          {showStatus && (
            <MultipleFileUploadStatus
              statusToggleText={`${successFileCount} of ${uploads.size} files uploaded`}
              statusToggleIcon={statusIcon}
            >
              {Array.from(uploads.entries()).map(([file, upload], index) => (
                <MultipleFileUploadStatusItem
                  customFileHandler={() => {}}
                  fileIcon={<FileIcon />}
                  file={file}
                  key={`${file.name}-${index}`}
                  onClearClick={() => handleRemoveUpload(file)}
                  progressValue={upload.progress}
                  progressVariant={
                    upload.error
                      ? "danger"
                      : upload.response
                        ? "success"
                        : undefined
                  }
                  progressHelperText={
                    upload.error ? (
                      <HelperText isLiveRegion>
                        <HelperTextItem variant="error">
                          {(upload.error as AxiosError).message ||
                            "Upload failed"}
                        </HelperTextItem>
                      </HelperText>
                    ) : upload.progress === 100 && !upload.response ? (
                      <HelperText isLiveRegion>
                        <HelperTextItem variant="warning">
                          <Spinner isInline />
                          File uploaded. Waiting for the server to process it.
                        </HelperTextItem>
                      </HelperText>
                    ) : upload.response ? (
                      <HelperText isLiveRegion>
                        <HelperTextItem variant="default">
                          Document uploaded successfully
                        </HelperTextItem>
                      </HelperText>
                    ) : undefined
                  }
                />
              ))}
            </MultipleFileUploadStatus>
          )}
          <Modal
            isOpen={rejectedFiles.length > 0}
            aria-label="unsupported file upload attempted"
            onClose={() => setRejectedFiles([])}
            variant="small"
          >
            <ModalHeader title="Unsupported files" titleIconVariant="warning" />
            <ModalBody>
              <List>
                {rejectedFiles.map((e) => (
                  <ListItem key={e.file.name}>{e.file.name}</ListItem>
                ))}
              </List>
            </ModalBody>
          </Modal>
        </MultipleFileUpload>
      </StackItem>
    </Stack>
  );
};
