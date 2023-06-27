/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiPageContentBody } from '@elastic/eui';

import { useEffect } from 'react';
import { CoreStart, ChromeBreadcrumb } from '../../../../../../src/core/public';
import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
import { SearchInputBar } from './search_components/search_bar';
import { ServiceEndpoints } from '../../../../common';
import { Header } from '../../common/header';
import { SearchResults, QueryError, QueryStringError } from '../../../types/index';
import { ResultComponents } from './result_components/result_components';
import { useSearchRelevanceContext, initialQueryErrorState } from '../../../contexts';

const DEFAULT_QUERY = '{}';

interface SearchResultProps {
  http: CoreStart['http'];
}

export const SearchResult = ({ http }: SearchResultProps) => {
  const [queryString1, setQueryString1] = useState(DEFAULT_QUERY);
  const [queryString2, setQueryString2] = useState(DEFAULT_QUERY);
  const [queryResult1, setQueryResult1] = useState<SearchResults>({} as any);
  const [queryResult2, setQueryResult2] = useState<SearchResults>({} as any);
  const [searchBarValue, setSearchBarValue] = useState('');
  const [hasSummary, setHasSummary] = useState(false);

  const {
    updateComparedResult1,
    updateComparedResult2,
    selectedIndex1,
    selectedIndex2,
    setQueryError1,
    setQueryError2,
    query1,
    query2,
    searchValue,
    pipelines,
    pipeline1,
    pipeline2,
  } = useSearchRelevanceContext();

  useEffect(() => {
    if (query1) {
      setQueryString1(query1);
    }
    if (query2) {
      setQueryString2(query2);
    }
    if (searchValue) {
      setSearchBarValue(searchValue);
    }
  }, []);

  const onClickSearch = () => {
    const queryErrors = [{ ...initialQueryErrorState }, { ...initialQueryErrorState }];
    const jsonQueries = [{}, {}];

    validateQuery(selectedIndex1, queryString1, queryErrors[0]);
    const qa1 =
      pipeline1 !== '' && JSON.stringify(pipelines[pipeline1]).includes('"usecase":"QAndA"');
    jsonQueries[0] = rewriteQuery(searchBarValue, queryString1, queryErrors[0], qa1);

    validateQuery(selectedIndex2, queryString2, queryErrors[1]);
    const qa2 =
      pipeline2 !== '' && JSON.stringify(pipelines[pipeline2]).includes('"usecase":"QAndA"');
    jsonQueries[1] = rewriteQuery(searchBarValue, queryString2, queryErrors[1], qa2);

    handleQuery(jsonQueries, queryErrors);
  };

  const validateQuery = (selectedIndex: string, queryString: string, queryError: QueryError) => {
    // Check if select an index
    if (!selectedIndex.length) {
      queryError.selectIndex = 'An index is required. Select an index.';
    }

    // Check if query string is empty
    if (!queryString.length) {
      queryError.queryString = QueryStringError.empty;
    }
  };

  const rewriteQuery = (
    searchBarValue: string,
    queryString: string,
    queryError: QueryError,
    isQandA: boolean
  ) => {
    if (queryString.trim().length > 0) {
      try {
        if (isQandA) {
          return {
            ...JSON.parse(queryString),
            ext: { question_extension: { question: searchBarValue } },
          };
        }
        return JSON.parse(queryString.replace(/%SearchText%/g, searchBarValue));
      } catch {
        queryError.queryString = QueryStringError.invalid;
      }
    }
  };

  const handleQuery = (jsonQueries: any, queryErrors: QueryError[]) => {
    let requestBody = {};

    // Handle query1
    if (queryErrors[0].queryString.length || queryErrors[0].selectIndex.length) {
      setQueryError1(queryErrors[0]);
      setQueryResult1({} as any);
      updateComparedResult1({} as any);
    } else if (!queryErrors[0].queryString.length && !queryErrors[0].selectIndex.length) {
      requestBody = {
        query1: {
          index: selectedIndex1,
          pipeline: pipeline1,
          ...jsonQueries[0],
        },
      };
    }

    // Handle query2
    if (queryErrors[1].queryString.length || queryErrors[1].selectIndex.length) {
      setQueryError2(queryErrors[1]);
      setQueryResult2({} as any);
      updateComparedResult2({} as any);
    } else if (!queryErrors[1].queryString.length && !queryErrors[1].selectIndex.length) {
      requestBody = {
        ...requestBody,
        query2: {
          index: selectedIndex2,
          pipeline: pipeline2,
          ...jsonQueries[1],
        },
      };
    }

    if (Object.keys(requestBody).length !== 0) {
      http
        .post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify(requestBody),
        })
        .then((res) => {
          if (res.result1) {
            setQueryResult1(res.result1);
            updateComparedResult1(res.result1);
          }

          if (res.result2) {
            setQueryResult2(res.result2);
            updateComparedResult2(res.result2);
          }

          if (res.errorMessage1) {
            setQueryError1({
              ...queryErrors[0],
              queryString: res.errorMessage1,
            });
          }

          if (res.errorMessage2) {
            setQueryError2({
              ...queryErrors[1],
              queryString: res.errorMessage2,
            });
          }
        })
        .catch((error: Error) => {
          console.error(error);
        });
    }
    const hasSummary1 =
      pipeline1 !== '' &&
      ((pipeline1 !== '' && JSON.stringify(pipelines[pipeline1]).includes('"usecase":"QAndA"')) ||
        (pipeline1 !== '' && JSON.stringify(pipelines[pipeline1]).includes('"usecase":"summary"')));
    const hasSummary2 =
      pipeline2 !== '' &&
      ((pipeline2 !== '' && JSON.stringify(pipelines[pipeline2]).includes('"usecase":"QAndA"')) ||
        (pipeline2 !== '' && JSON.stringify(pipelines[pipeline2]).includes('"usecase":"summary"')));
    if (hasSummary1 || hasSummary2) {
      setHasSummary(true);
    } else {
      setHasSummary(false);
    }
  };

  return (
    <>
      <Header>
        <SearchInputBar
          searchBarValue={searchBarValue}
          setSearchBarValue={setSearchBarValue}
          onClickSearch={onClickSearch}
        />
      </Header>
      <EuiPageContentBody className="search-relevance-flex">
        <SearchConfigsPanel
          queryString1={queryString1}
          queryString2={queryString2}
          setQueryString1={setQueryString1}
          setQueryString2={setQueryString2}
          singlePage={false}
        />
        <ResultComponents
          queryResult1={queryResult1}
          queryResult2={queryResult2}
          hasSummary={hasSummary}
          singlePage={false}
        />
      </EuiPageContentBody>
    </>
  );
};
