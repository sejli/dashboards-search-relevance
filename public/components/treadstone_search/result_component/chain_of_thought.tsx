/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useState } from 'react';
import { useInterval } from 'react-use';
import {
  EuiButtonEmpty,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel,
  EuiPopover,
  EuiProgress,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
import { SessionHistory } from './session_history';

interface ChainOfThoughtProps {
  query: string;
  initialState: boolean;
  isCompleted: boolean;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  sessionID: string;
  taskID: string;
  http: CoreStart['http'];
}

export const ChainOfThought = ({
  query,
  initialState,
  isCompleted,
  setIsCompleted,
  sessionID,
  taskID,
  http,
}: ChainOfThoughtProps) => {
  // const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [session, setSession] = useState<any[]>();
  const [final, setFinal] = useState<any>({ _source: { question: '' } });

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>();
  const onPopoverClick = () => {
    setIsPopoverOpen((isOpen) => !isOpen);
  };
  const closePopover = () => setIsPopoverOpen(false);
  const button = (
    <EuiButtonEmpty iconType={'iInCircle'} iconSide={'right'} onClick={onPopoverClick}>
      How was this result generated?
    </EuiButtonEmpty>
  );

  const delay = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const getSession = async (id: string) => {
    let found = false;
    while (!found) {
      await http
        .post(ServiceEndpoints.GetSessions, { body: JSON.stringify({ id, order: 'asc' }) })
        .then((res) => {
          const hits: any[] = res.body.hits.hits;
          console.log('hits: ', hits);
          setSession(hits);
          hits.forEach((hit) => {
            if (hit?._source?.final_answer) {
              if (final._source.question !== hit._source.question) {
                setIsCompleted(true);
                setFinal(hit);
                found = true;
              }
            }
          });
        });
      await delay(5000);
    }
  };

  useEffect(() => {
    getSession(sessionID);
  }, [taskID]);

  const finalAnswer = (answer: any) => {
    if (answer) {
      return (
        <>
          <EuiSpacer />
          <EuiSplitPanel.Outer grow={false} style={{ width: '75%', marginLeft: '15px' }}>
            <EuiSplitPanel.Inner>
              <EuiText>{answer._source.answer}</EuiText>
              <EuiSpacer />
            </EuiSplitPanel.Inner>
            <EuiSplitPanel.Inner grow={false} style={{ textAlign: 'right' }}>
              <EuiPopover
                button={button}
                isOpen={isPopoverOpen}
                closePopover={closePopover}
                anchorPosition="rightCenter"
              >
                <SessionHistory session={session} query={query} />
              </EuiPopover>
            </EuiSplitPanel.Inner>
          </EuiSplitPanel.Outer>
        </>
      );
    }
  };

  return (
    <>
      {!isCompleted && <EuiProgress size="xs" color="primary" />}
      {isCompleted && finalAnswer(final)}
    </>
  );
};
