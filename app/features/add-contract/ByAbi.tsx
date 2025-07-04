import React, { useState } from "react";
import styled from "styled-components";
import { Button, TabBody as rTabBody, TextField, Fieldset } from "react95";
import { generate as randomWords } from "random-words";
import validateAbi from "../common/validateAbi";
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

const generateName = () => {
  const words = randomWords({ exactly: 2 });
  const name = words
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join("");
  return name;
};

const ByAbi = ({ closeModal }) => {
  const { addByAbi } = Contracts.useContainer();
  const [rawAbi, setRawAbi] = useState("");
  const [name, setName] = useState(generateName());
  const isAbiValid = validateAbi(rawAbi);

  const addContract = () => {
    addByAbi(JSON.parse(rawAbi), name);
    closeModal();
  };
  return (
    <>
      <TabBody>
        <p>
          The Application Binary Interface (ABI) is an array of objects that
          specify how to interact with Ethereum smart contracts.
        </p>
        <br />
        <StyledTextField
          placeholder="Paste ABI here..."
          onChange={(e) => {
            setRawAbi(e.target.value);
          }}
          multiline
          style={{ height: `240px` }}
        />
        <br />
        <Fieldset label="Name (required):">
          <p>
            This can be anything you want and can be changed later. A random
            name is generated for your convenience.
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
            disabled={!isAbiValid || name.trim() === ""}
          >
            Add Contract by ABI
          </Button>
        </ButtonContainer>
      </TabBody>
    </>
  );
};
export default ByAbi;
