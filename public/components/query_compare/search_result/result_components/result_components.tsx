/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EuiSplitPanel, EuiTitle, EuiFlexGroup, EuiPanel } from '@elastic/eui';

import { SearchResults } from '../../../../types/index';
import { ResultPanel } from './result_panel';

import './result_components.scss';

interface ResultComponentsProps {
  queryResult1: SearchResults;
  queryResult2: SearchResults;
}

const InitialState = () => {
  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      grow={true}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <EuiFlexGroup justifyContent="center">
        <EuiTitle>
          <h2>Add queries to compare search results.</h2>
        </EuiTitle>
      </EuiFlexGroup>
    </EuiPanel>
  );
};

const ResultPanels = ({ queryResult1, queryResult2 }: ResultComponentsProps) => {
  return (
    <EuiSplitPanel.Outer direction="row" hasShadow={false} hasBorder={false}>
      <ResultPanel resultNumber={1} queryResult={queryResult1} />
      <ResultPanel resultNumber={2} queryResult={queryResult2} />
    </EuiSplitPanel.Outer>
  );
};

export const ResultComponents = ({ queryResult1, queryResult2 }: ResultComponentsProps) => {
  const [initialState, setInitialState] = useState<boolean>(true);

  // Set initial state
  useEffect(() => {
    if (Array.isArray(queryResult1.hits?.hits) || Array.isArray(queryResult2.hits?.hits)) {
      setInitialState(false);
    } else if (initialState !== true) {
      setInitialState(true);
    }
  }, [queryResult1, queryResult2, initialState]);

  // const results1 = document.getElementById('1');
  // const results2 = document.getElementById('2');
  // if (!initialState && results1 && results2) {
  //   console.log(results1);
  //   console.log(results2);

  //   const rows1 = results1?.getElementsByTagName('tr');
  //   const rows2 = results2?.getElementsByTagName('tr');

  //   for (let i = 0; i < rows1.length; i++) {
  //     if (rows1[i].offsetHeight > rows2[i].offsetHeight) {
  //       rows2[i].style.height = rows1[i].offsetHeight + 'px';
  //       console.log('updating rows2 to rows1 ' + rows1[i].offsetHeight + 'px');
  //     } else if (rows1[i].offsetHeight < rows2[i].offsetHeight) {
  //       rows1[i].style.height = rows2[i].offsetHeight + 'px';
  //       console.log('updating rows1 to rows2 ' + rows2[i].offsetHeight + 'px');
  //     }
  //   }
  // }

  // useEffect(() => {
  //   const images = document.getElementsByTagName('img');
  //   if (images) {
  //     let loaded = true;
  //     for (let i = 0; i < images.length; i++) {
  //       if (images[i].hidden === true) {
  //         loaded = false;
  //         console.log('not loaded');
  //       }
  //     }
  //     if (!loaded) {
  //       return;
  //     }
  //   }
  //   const results1 = document.getElementById('1');
  //   const results2 = document.getElementById('2');
  //   if (!initialState && results1 && results2) {
  //     console.log(results1);
  //     console.log(results2);

  //     const rows1 = results1?.getElementsByTagName('tr');
  //     const rows2 = results2?.getElementsByTagName('tr');

  //     for (let i = 0; i < rows1.length; i++) {
  //       if (rows1[i].offsetHeight > rows2[i].offsetHeight) {
  //         rows2[i].style.height = rows1[i].offsetHeight + 'px';
  //         console.log('updating rows2 to rows1 ' + rows1[i].offsetHeight + 'px');
  //       } else if (rows1[i].offsetHeight < rows2[i].offsetHeight) {
  //         rows1[i].style.height = rows2[i].offsetHeight + 'px';
  //         console.log('updating rows1 to rows2 ' + rows2[i].offsetHeight + 'px');
  //       }
  //     }
  //   }
  // });

  return (
    <>
      {initialState === true ? (
        <InitialState />
      ) : (
        <ResultPanels queryResult1={queryResult1} queryResult2={queryResult2} />
      )}
    </>
  );
};
