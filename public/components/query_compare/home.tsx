/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { CoreStart, ChromeBreadcrumb } from '../../../../../src/core/public';
import '../../ace-themes/sql_console';
import { CreateIndex } from './create_index';
import { SearchResult } from './search_result';
import { useSearchRelevanceContext } from '../../contexts';
import { DocumentsIndex } from '../../types/index';
import { ServiceEndpoints } from '../../../common';
import { Flyout } from '../common/flyout';

import './home.scss';

interface QueryExplorerProps {
  parentBreadCrumbs: ChromeBreadcrumb[];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
  setToast: (title: string, color?: string, text?: any, side?: string) => void;
  chrome: CoreStart['chrome'];
  savedConfiguration: string;
}

export const Home = ({
  parentBreadCrumbs,
  notifications,
  http,
  navigation,
  setBreadcrumbs,
  setToast,
  chrome,
  savedConfiguration,
}: QueryExplorerProps) => {
  const {
    documentsIndexes,
    setDocumentsIndexes,
    allowList,
    setAllowList,
    setSelectedIndex1,
    setQuery1,
    setPipeline1,
    setSelectedIndex2,
    setQuery2,
    setPipeline2,
    setSearchValue,
    pipelines,
    setPipelines,
    showFlyout,
    setSavedConfiguration,
  } = useSearchRelevanceContext();

  useEffect(() => {
    setBreadcrumbs([...parentBreadCrumbs]);
  }, [setBreadcrumbs, parentBreadCrumbs]);
  // console.log(documentsIndexes);
  // Get Indexes
  useEffect(() => {
    setSavedConfiguration(savedConfiguration);
    http.get(ServiceEndpoints.GetIndexes).then((res: DocumentsIndex[]) => {
      setDocumentsIndexes(res);
    });
    http
      .post(ServiceEndpoints.GetDocument, {
        body: JSON.stringify({
          index: 'configurations',
          docID: 'allowlist_indices',
        }),
      })
      .then((res) => {
        console.log(res._source.indices);
        setAllowList(res._source.indices);
      });
    // Get pipelines using console API
    http
      .post('/api/console/proxy', {
        query: {
          path: '/_search/pipeline',
          method: 'GET',
        },
        body: {},
        prependBasePath: true,
        asResponse: true,
      })
      .then((res) => {
        setPipelines(res?.body);
      });
  }, [http, setDocumentsIndexes, setPipelines]);

  useEffect(() => {
    if (savedConfiguration) {
      http
        .post(ServiceEndpoints.GetSavedConfiguration, {
          body: JSON.stringify({
            query: {
              match: {
                title: savedConfiguration,
              },
            },
          }),
        })
        .then((res) => {
          if (res?.hits?.hits?.length > 0) {
            const source = res?.hits?.hits[0]?._source?.configuration;
            if (source?.query1) {
              for (const key in source?.query1) {
                if (source?.query1.hasOwnProperty(key)) {
                  const value = source?.query1[key];
                  switch (key) {
                    case 'dsl_query': {
                      setQuery1(value);
                      break;
                    }
                    case 'index': {
                      setSelectedIndex1(value);
                      break;
                    }
                    case 'search_pipeline': {
                      setPipeline1(value);
                      break;
                    }
                  }
                }
              }
            }
            if (source?.query2) {
              for (const key in source?.query2) {
                if (source?.query2.hasOwnProperty(key)) {
                  const value = source?.query2[key];
                  switch (key) {
                    case 'dsl_query': {
                      setQuery2(value);
                      break;
                    }
                    case 'index': {
                      setSelectedIndex2(value);
                      break;
                    }
                    case 'search_pipeline': {
                      setPipeline2(value);
                      break;
                    }
                  }
                }
              }
            }
            if (source?.search) {
              setSearchValue(source?.search);
            }
          }
        });
    }
  }, []);

  return (
    <>
      <div className="osdOverviewWrapper">
        {documentsIndexes.length ? <SearchResult http={http} /> : <CreateIndex />}
      </div>
      {showFlyout && <Flyout />}
    </>
  );
};
