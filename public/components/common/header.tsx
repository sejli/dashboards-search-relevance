/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPageHeader, EuiCallOut, EuiText, EuiLink, EuiPanel } from '@elastic/eui';

interface HeaderProps {
  page: string
  children?: React.ReactNode;
}

export const Header = ({ page, children }: HeaderProps) => {
  const header = {
    searchComparison: (
      <>
        <EuiPageHeader pageTitle="Search Comparison Tool">
          <EuiText>Compare results using the same search text with different queries.</EuiText>
          {children}
        </EuiPageHeader>
      </>
    ),
    aiSearch: (
      <>
        <EuiPageHeader pageTitle="Conversational Search">
          <EuiText>View search results with different algorithms powering search.</EuiText>
          {children}
        </EuiPageHeader>
      </>
    ),
  }
  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      grow={false}
      borderRadius="none"
      style={{ borderBottom: '1px solid #D3DAE6' }}
    >
      {/* <EuiPageHeader pageTitle="Preview Search Results">
        <EuiText>View search results with different algorithms powering search.</EuiText>
        <EuiCallOut title="Experimental Feature" iconType="iInCircle">
          <EuiText>
            <p>
              Compare results using the same search text with different queries. For more
              information, see the{' '}
              <EuiLink
                href="https://opensearch.org/docs/latest/search-plugins/search-relevance"
                target="_blank"
              >
                Compare Search Results Documentation
              </EuiLink>
              . To leave feedback, visit{' '}
              <EuiLink
                href="https://forum.opensearch.org/t/feedback-experimental-feature-compare-search-results/11331"
                target="_blank"
              >
                forums.opensearch.com
              </EuiLink>
              .
            </p>
          </EuiText>
        </EuiCallOut>
        {children}
      </EuiPageHeader> */}
      {header[page]}
    </EuiPanel>
  );
};
