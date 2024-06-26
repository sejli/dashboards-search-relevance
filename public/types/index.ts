/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export interface DocumentsIndex {
  'docs.count': string;
  'docs.deleted': string;
  health: 'green' | 'yellow';
  index: string;
  pri: string;
  'pri.store.size': string;
  rep: string;
  status: 'open' | 'close';
  'store.size': string;
  uuid: string;
}

export interface IDocType {
  [key: string]: any;
}

export interface Document {
  _index: string;
  _id: string;
  _score: number;
  _source: IDocType;
  fields: IDocType;
}

export interface SearchResults {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: Document[];
  };
  generatedText: [{ processorTag: string; usecase: string; value: string }];
}

export enum QueryStringError {
  empty = 'A query is required. Enter a query.',
  invalid = 'Query syntax is invalid. Enter a valid query.',
}

export interface QueryError {
  selectIndex: 'An index is required. Select an index.' | '';
  queryString: QueryStringError | string | any;
}
