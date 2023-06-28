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
import { ResultGridComponent } from './result_grid';

interface ChainOfThoughtProps {
  query: string;
  initialState: boolean;
  isCompleted: boolean;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  sessionID: string;
  taskID: string;
  http: CoreStart['http'];
  index: string;
}

export const ChainOfThought = ({
  query,
  initialState,
  isCompleted,
  setIsCompleted,
  sessionID,
  taskID,
  http,
  index,
}: ChainOfThoughtProps) => {
  // const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [session, setSession] = useState<any[]>();
  const [final, setFinal] = useState<any>({ _source: { question: '' } });
  const [documentIds, setDocumentIds] = useState<any[]>();
  const [answers, setAnswers] = useState<any[]>([]);
  const [failed, setFailed] = useState<boolean>(false);

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
    console.log('id:', id, 'task:', taskID);
    let found = false;
    while (!found) {
      await http
        .post(ServiceEndpoints.GetTask, { body: JSON.stringify({ taskID }) })
        .then(async (res) => {
          if (res.body.state === 'FAILED' || res.body.state === 'COMPLETED') {
            found = true;
            console.log('Task', res.body.state);
            await http
              .post(ServiceEndpoints.GetSessions, {
                body: JSON.stringify({ id, order: 'asc', task: taskID }),
              })
              .then((res2) => {
                const hits: any[] = res2.body.hits.hits;
                console.log('hits: ', hits);
                setSession(hits);
                hits.forEach((hit) => {
                  if (hit?._source?.final_answer) {
                    if (final._source.question !== hit._source.question) {
                      const prevAnswer = hits.at(-1)._source.answer;
                      setAnswers((prev: any) => [...prev, hit]);
                      setDocumentIds(
                        Array.from(
                          prevAnswer.matchAll(/document_id: (\w+)/g),
                          (match: any) => match[1]
                        )
                      );
                      setIsCompleted(true);
                      setFinal(hit);
                      found = true;
                    }
                  }
                });
              });
          }
          if (res.body.state === 'FAILED') {
            setFailed(true);
          }
        });
      await delay(1000);
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
            </EuiSplitPanel.Inner>
            <EuiSplitPanel.Inner grow={false} style={{ textAlign: 'right' }}>
              <EuiPopover
                button={button}
                isOpen={isPopoverOpen}
                closePopover={closePopover}
                anchorPosition="rightCenter"
              >
                <SessionHistory session={session} query={query} final={final} answers={answers} />
              </EuiPopover>
            </EuiSplitPanel.Inner>
          </EuiSplitPanel.Outer>
        </>
      );
    }
  };

  return (
    <>
      {!isCompleted && !failed && <EuiProgress size="xs" color="primary" />}
      {isCompleted && finalAnswer(final)}
      {isCompleted && <ResultGridComponent docIds={documentIds} http={http} index={index} />}
    </>
  );
};
