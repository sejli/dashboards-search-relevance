/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiSelect,
  EuiSelectable,
  EuiSelectableOption,
  EuiSpacer,
  EuiSuperSelect,
} from '@elastic/eui';
import React, { useState } from 'react';

interface SearchBarProps {
  searchBarValue: string;
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  onClickSearch: () => void;
}

export const SearchInputBar = ({
  searchBarValue,
  setSearchBarValue,
  onClickSearch,
}: SearchBarProps) => {
  return (
    <>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={true}>
          <EuiFieldSearch
            fullWidth={true}
            placeholder="Search"
            value={searchBarValue}
            onChange={(e) => setSearchBarValue(e.target.value)}
            isClearable={true}
            onSearch={onClickSearch}
            aria-label="Enter your Search query"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={onClickSearch} aria-label="searchRelevance-searchButton">
            Search
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
