import React, { useState } from "react";
import styled from "styled-components";
import { Button, TabBody as rTabBody, TextField, Fieldset } from "react95";
import validateRawArtifact from "../common/validateRawArtifact";
import Contracts from "../../containers/Contracts";
import Input from "../common/Input";

const TabBody = styled(rTabBody)`
  width: 100%;
  height: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledTextField = styled(TextField)`
  & > textarea {
    color: ${({ theme }) => theme.materialText};
    font-family: monospace;

    &::placeholder {
      color: ${({ theme }) => theme.materialTextDisabled};
      opacity: 1;
    }
  }
`;

const ByAbi = ({ closeModal }) => {
  const { addByArtifact } = Contracts.useContainer();
  const [rawArtifact, setRawArtifact] = useState("");
  const [name, setName] = useState("");
  const isArtifactValid = validateRawArtifact(rawArtifact);

  const handleTextAreaChange = (e) => {
    const rawArtifact = e.target.value;
    setRawArtifact(e.target.value);
    if (validateRawArtifact(rawArtifact)) {
      setName(JSON.parse(rawArtifact).contractName);
    }
  };

  const addContract = () => {
    addByArtifact(JSON.parse(rawArtifact), name);
    closeModal();
  };
  return (
    <>
      <TabBody>
        <p>
          Dapp development tools like Buidler and Truffle produce JSON artifacts
          as a result of compiling Ethereum smart contracts.
        </p>
        <br />
        <StyledTextField
          placeholder="Paste JSON artifact here..."
          onChange={handleTextAreaChange}
          multiline
          style={{ height: `240px` }}
        />
        <br />
        <Fieldset label="Name (required):">
          <p>
            This can be anything you want and can be changed later. We will
            infer this from your JSON artifact but you are welcome to change it.
          </p>
          <br />
          <Input
            placeholder="MyDapp"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Fieldset>
        <ButtonContainer>
          <Button
            fullWidth
            size="lg"
            style={{ marginTop: "1rem" }}
            onClick={closeModal}
          >
            Close
          </Button>
          <Button
            fullWidth
            size="lg"
            style={{ marginTop: "1rem" }}
            onClick={addContract}
            disabled={!isArtifactValid || name.trim() === ""}
          >
            Add Contract by Artifact
          </Button>
        </ButtonContainer>
      </TabBody>
    </>
  );
};
export default ByAbi;
