import type React from "react";

import { Bullseye, Spinner } from "@patternfly/react-core";

export const AppPlaceholder: React.FC = () => {
  return (
    <Bullseye>
      <div className="pf-v6-u-display-flex pf-v6-u-flex-direction-column">
        <div>
          <Spinner />
        </div>
        <div className="pf-v6-c-content">
          <h3>Loading...</h3>
        </div>
      </div>
    </Bullseye>
  );
};
