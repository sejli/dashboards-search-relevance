/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCollapsibleNavGroup, EuiTab, EuiTabs, EuiText, EuiTitle } from '@elastic/eui';
import React, { useMemo } from 'react';
import { useState } from 'react';

interface SessionHistoryProps {
  query: string;
  session: any;
}

export const SessionHistory = ({ session, query }: SessionHistoryProps) => {
  const tabs = [
    {
      id: 'reasoning',
      name: 'Reasoning',
      disabled: false,
      content: (
        <>
          {/* <EuiTitle>
            <h2>Request</h2>
          </EuiTitle>
          <EuiTitle>
            <h3>Query</h3>
          </EuiTitle>
          <EuiText>{query}</EuiText>
          <EuiTitle>
            <h3>Prompt</h3>
          </EuiTitle>
          <EuiText>You are an agent who helps make recommendations and buy things.</EuiText>
          <EuiTitle>
            <h2>Response</h2>
          </EuiTitle> */}
          <div style={{ margin: 'auto' }}>
            <EuiText grow={false}>
              <h3>Request</h3>
              <b>Query</b>
              <p>{query}</p>
              <b>Prompt</b>
              <p>You are an agent who helps make recommendations and buy things.</p>
              <h3>Response</h3>
            </EuiText>
            {session.map((step, index) => {
              return (
                <EuiCollapsibleNavGroup
                  title={`Step ${index + 1}`}
                  isCollapsible={true}
                  initialIsOpen={false}
                  paddingSize="none"
                >
                  <EuiText grow={false}>{step._source.answer}</EuiText>
                </EuiCollapsibleNavGroup>
              );
            })}
          </div>
        </>
      ),
    },
    {
      id: 'history',
      name: 'Session History',
      disabled: true,
    },
  ];

  const [selectedTabId, setSelectedTabId] = useState<string>('reasoning');
  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };
  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        disabled={tab.disabled}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <div style={{ maxHeight: '480px', maxWidth: '440px', overflow: 'auto' }}>
      <EuiTabs size="s" expand>
        {renderTabs()}
      </EuiTabs>
      {selectedTabContent}
    </div>
  );
};
