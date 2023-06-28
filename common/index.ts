/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'searchRelevance';
export const PLUGIN_NAME = 'Search Relevance';

export enum ServiceEndpoints {
  GetIndexes = '/api/relevancy/search/indexes',
  GetSearchResults = '/api/relevancy/search',
  GetStats = '/api/relevancy/stats',
  GetSavedConfiguration = '/api/relevancy/search/savedConfiguration',
  ChainOfThought = '/api/relevancy/CoT',
  GetTask = '/api/relevancy/tasks',
  GetSessions = '/api/relevancy/sessions',
  GetDocument = '/api/relevancy/doc',
}

export const API_ROUTE_PREFIX = '/_plugins/_ml';
export const PROFILE_BASE_API = `${API_ROUTE_PREFIX}/profile`;
export const MODEL_BASE_API = `${API_ROUTE_PREFIX}/models`;
export const MODEL_SEARCH_API = `${MODEL_BASE_API}/_search`;
export const TASK_BASE_API = `${API_ROUTE_PREFIX}/tasks`;

export const SESSIONS_INDEX = 'my-sessions';
export const MODEL_INDEX = '.plugins-ml-model';
