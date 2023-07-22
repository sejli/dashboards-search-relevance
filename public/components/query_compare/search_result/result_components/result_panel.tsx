/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiSplitPanel,
  EuiText,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from '@elastic/eui';

import { ResultGridComponent } from './result_grid';
import { QueryError, SearchResults } from '../../../../types/index';
import { useSearchRelevanceContext } from '../../../../contexts';

import './result_components.scss';

interface ResultPanelProps {
  resultNumber: number;
  queryResult: SearchResults;
  queryError: QueryError;
  hasSummary: boolean;
}

export const ResultPanel = ({
  resultNumber,
  queryResult,
  hasSummary,
  queryError,
}: ResultPanelProps) => {
  const { comparedResult1, comparedResult2 } = useSearchRelevanceContext();

  const getComparedDocumentsRank = () => {
    return resultNumber === 1 ? comparedResult2 : comparedResult1;
  };

  console.log(resultNumber, queryResult, queryError);

  const errorMessage = (
    <>
      <EuiHorizontalRule margin="s" />
      <EuiText>Sorry, there was an error. Please try again later.</EuiText>
    </>
  );

  return (
    <EuiSplitPanel.Inner className="search-relevance-result-panel">
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h2 style={{ fontWeight: '300', fontSize: '21px' }}>{`Result ${resultNumber}`}</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h2 style={{ fontWeight: '700', fontSize: '14px' }}>
              {queryResult?.hits?.hits?.length > 0 ? queryResult?.hits?.hits?.length : 0} results
            </h2>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      {typeof queryError.queryString !== 'string' && queryError.queryString?.statusCode === 500 ? (
        errorMessage
      ) : queryResult?.hits?.hits?.length ? (
        <ResultGridComponent
          queryResult={queryResult}
          comparedDocumentsRank={getComparedDocumentsRank()}
          resultNumber={resultNumber}
          hasSummary={hasSummary}
        />
      ) : (
        <>
          <EuiHorizontalRule margin="s" />
          <EuiText>No results.</EuiText>
        </>
      )}
    </EuiSplitPanel.Inner>
  );
};
