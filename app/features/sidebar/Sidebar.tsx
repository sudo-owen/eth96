import React from "react";
import styled from "styled-components";
import { Cutout } from "react95";

import AddContractBtn from "../add-contract/AddContractBtn";
import Contracts from "../../containers/Contracts";
import ContractItem from "./ContractItem";
import ConnectOptions from "../connection/ConnectOptions";
import ContractManagementButtons from "./ContractManagementButtons";

const Container = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const ContractsSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1;
`;

const FilesCutout = styled(Cutout)`
  flex-grow: 1;
  background: ${({ theme }) => theme.canvas};
  color: ${({ theme }) => theme.materialText};
  overflow: hidden;
  padding-bottom: 35px;

  &:before {
    z-index: unset;
    width: 100%;
    height: 100%;
  }
`;

const FilesContainer = styled.div`
  overflow: auto;
  width: 100%;
  height: 100%;
`;

const ContractsHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const Sidebar = () => {
  const { contracts } = Contracts.useContainer();
  return (
    <Container>
      <ConnectOptions />
      <ContractsSection>
        <ContractsHeader>
          <div>Contracts:</div>
          <ContractManagementButtons />
        </ContractsHeader>
        <FilesCutout shadow={false}>
          <FilesContainer className="contract-list">
            {contracts.map((c, i) => (
              <ContractItem key={c.name} idx={i} name={c.name} />
            ))}
            <AddContractBtn />
          </FilesContainer>
        </FilesCutout>
      </ContractsSection>
    </Container>
  );
};

export default Sidebar;
