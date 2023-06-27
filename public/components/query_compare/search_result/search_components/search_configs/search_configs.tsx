/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPanel, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import '../../../../../ace-themes/sql_console';
import { SearchConfig } from './search_config';
import { useSearchRelevanceContext } from '../../../../../contexts';

import './search_configs.scss';

interface SearchConfigsPanelProps {
  queryString1: string;
  queryString2: string;
  setQueryString1: React.Dispatch<React.SetStateAction<string>>;
  setQueryString2: React.Dispatch<React.SetStateAction<string>>;
  singlePage: boolean;
}

export const SearchConfigsPanel = ({
  queryString1,
  queryString2,
  setQueryString1,
  setQueryString2,
  singlePage,
}: SearchConfigsPanelProps) => {
  const {
    selectedIndex1,
    setSelectedIndex1,
    selectedIndex2,
    setSelectedIndex2,
    queryError1,
    queryError2,
    setQueryError1,
    setQueryError2,
    pipeline1,
    setPipeline1,
    pipeline2,
    setPipeline2,
  } = useSearchRelevanceContext();

  return (
    <EuiPanel
      hasShadow={false}
      hasBorder={false}
      color="transparent"
      grow={false}
      borderRadius="none"
      style={{ borderBottom: '1px solid #D3DAE6' }}
    >
      <EuiFlexGroup>
        <EuiFlexItem className="search-relevance-config">
          <SearchConfig
            queryNumber={1}
            queryString={queryString1}
            setQueryString={setQueryString1}
            selectedIndex={selectedIndex1}
            setSelectedIndex={setSelectedIndex1}
            queryError={queryError1}
            setQueryError={setQueryError1}
            pipeline={pipeline1}
            setPipeline={setPipeline1}
            singlePage={singlePage}
          />
        </EuiFlexItem>
        {!singlePage && (
          <EuiFlexItem className="search-relevance-config">
            <SearchConfig
              queryNumber={2}
              queryString={queryString2}
              setQueryString={setQueryString2}
              selectedIndex={selectedIndex2}
              setSelectedIndex={setSelectedIndex2}
              queryError={queryError2}
              setQueryError={setQueryError2}
              pipeline={pipeline2}
              setPipeline={setPipeline2}
              singlePage={singlePage}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
