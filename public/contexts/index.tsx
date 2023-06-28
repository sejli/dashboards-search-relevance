/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';

import { DocumentsIndex, SearchResults, QueryError } from '../types/index';
import { getDocumentRank, DocumentRank } from './utils';

export const initialQueryErrorState: QueryError = {
  selectIndex: '',
  queryString: '',
};

export interface SearchRelevanceContextProps {
  documentsIndexes: DocumentsIndex[];
  setDocumentsIndexes: React.Dispatch<React.SetStateAction<DocumentsIndex[]>>;
  showFlyout: boolean;
  setShowFlyout: React.Dispatch<React.SetStateAction<boolean>>;
  comparedResult1: DocumentRank;
  updateComparedResult1: (result: SearchResults) => void;
  comparedResult2: DocumentRank;
  updateComparedResult2: (result: SearchResults) => void;
  selectedIndex1: string;
  setSelectedIndex1: React.Dispatch<React.SetStateAction<string>>;
  selectedIndex2: string;
  setSelectedIndex2: React.Dispatch<React.SetStateAction<string>>;
  selectedIndex: string;
  setSelectedIndex: React.Dispatch<React.SetStateAction<string>>;
  query1: string;
  setQuery1: React.Dispatch<React.SetStateAction<string>>;
  query2: string;
  setQuery2: React.Dispatch<React.SetStateAction<string>>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  pipelines: {};
  setPipelines: React.Dispatch<React.SetStateAction<{}>>;
  pipeline1: string;
  setPipeline1: React.Dispatch<React.SetStateAction<string>>;
  pipeline2: string;
  setPipeline2: React.Dispatch<React.SetStateAction<string>>;
  queryError1: QueryError;
  setQueryError1: React.Dispatch<React.SetStateAction<QueryError>>;
  queryError2: QueryError;
  setQueryError2: React.Dispatch<React.SetStateAction<QueryError>>;
  savedConfiguration: string;
  setSavedConfiguration: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchRelevanceContext = createContext<SearchRelevanceContextProps | null>(null);

export const useSearchRelevanceContext = () => {
  const context = useContext(SearchRelevanceContext);

  if (!context) {
    throw Error('No Search Relevance context');
  }

  return context;
};

export const SearchRelevanceContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [documentsIndexes, setDocumentsIndexes] = useState<DocumentsIndex[]>([]);
  const [showFlyout, setShowFlyout] = useState(false);
  const [comparedResult1, setComparedResult1] = useState<DocumentRank>({});
  const [comparedResult2, setComparedResult2] = useState<DocumentRank>({});
  const [selectedIndex1, setSelectedIndex1] = useState('');
  const [selectedIndex2, setSelectedIndex2] = useState('');
  const [selectedIndex, setSelectedIndex] = useState('');
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [pipelines, setPipelines] = useState<{}>({});
  const [pipeline1, setPipeline1] = useState('');
  const [pipeline2, setPipeline2] = useState('');
  const [queryError1, setQueryError1] = useState<QueryError>(initialQueryErrorState);
  const [queryError2, setQueryError2] = useState<QueryError>(initialQueryErrorState);
  const [savedConfiguration, setSavedConfiguration] = useState<string>('');

  const updateComparedResult1 = (result: SearchResults) => {
    setComparedResult1(getDocumentRank(result?.hits?.hits));
  };

  const updateComparedResult2 = (result: SearchResults) => {
    setComparedResult2(getDocumentRank(result?.hits?.hits));
  };

  return (
    <SearchRelevanceContext.Provider
      value={{
        documentsIndexes,
        setDocumentsIndexes,
        showFlyout,
        setShowFlyout,
        comparedResult1,
        updateComparedResult1,
        comparedResult2,
        updateComparedResult2,
        selectedIndex1,
        setSelectedIndex1,
        selectedIndex2,
        setSelectedIndex2,
        selectedIndex,
        setSelectedIndex,
        query1,
        setQuery1,
        query2,
        setQuery2,
        searchValue,
        setSearchValue,
        pipelines,
        setPipelines,
        pipeline1,
        setPipeline1,
        pipeline2,
        setPipeline2,
        queryError1,
        setQueryError1,
        queryError2,
        setQueryError2,
        savedConfiguration,
        setSavedConfiguration,
      }}
    >
      {children}
    </SearchRelevanceContext.Provider>
  );
};
