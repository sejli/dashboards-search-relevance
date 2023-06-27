/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { RequestParams } from '@opensearch-project/opensearch';

import { IRouter } from '../../../../src/core/server';
import { METRIC_NAME, METRIC_ACTION } from '../metrics';
import { MODEL_BASE_API, SESSIONS_INDEX, ServiceEndpoints, TASK_BASE_API } from '../../common';

interface SearchResultsResponse {
  result1?: Object;
  result2?: Object;
  errorMessage1?: Object;
  errorMessage2?: Object;
}

const performance = require('perf_hooks').performance;

export function registerDslRoute(router: IRouter) {
  router.post(
    {
      path: ServiceEndpoints.GetSearchResults,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const { query1, query2 } = request.body;
      const actionName =
        query1 && query2 ? METRIC_ACTION.COMPARISON_SEARCH : METRIC_ACTION.SINGLE_SEARCH;
      let resBody: SearchResultsResponse = {};

      if (query1) {
        const { index, pipeline, size, ...rest } = query1;
        let params: RequestParams.Search;
        if (pipeline !== '') {
          params = {
            index,
            size,
            body: rest,
            search_pipeline: pipeline,
          };
        } else {
          params = {
            index,
            size,
            body: rest,
          };
        }

        const start = performance.now();
        try {
          const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
            'search',
            params
          );
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            200,
            end - start
          );
          resBody.result1 = resp;
        } catch (error) {
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            error.statusCode,
            end - start
          );

          if (error.statusCode !== 404) console.error(error);

          // Template: Error: {{Error.type}} – {{Error.reason}}
          const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

          resBody.errorMessage1 = {
            statusCode: error.statusCode || 500,
            body: errorMessage,
          };
        }
      }

      if (query2) {
        const { index, pipeline, size, ...rest } = query2;
        let params: RequestParams.Search;
        if (pipeline !== '') {
          params = {
            index,
            size,
            body: rest,
            search_pipeline: pipeline,
          };
        } else {
          params = {
            index,
            size,
            body: rest,
          };
        }

        const start = performance.now();
        try {
          const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
            'search',
            params
          );
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            200,
            end - start
          );
          resBody.result2 = resp;
        } catch (error) {
          const end = performance.now();
          if (error.statusCode !== 404) console.error(error);
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            error.statusCode,
            end - start
          );

          // Template: Error: {{Error.type}} – {{Error.reason}}
          const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

          resBody.errorMessage2 = {
            statusCode: error.statusCode || 500,
            body: errorMessage,
          };
        }
      }

      return response.ok({
        body: resBody,
      });
    }
  );

  router.post(
    {
      path: ServiceEndpoints.GetSavedConfiguration,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const params: RequestParams.Search = {
        index: 'configurations',
        body: request.body,
      };
      let resBody: any = {};
      try {
        const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'search',
          params
        );
        resBody = resp;
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);

        // Template: Error: {{Error.type}} – {{Error.reason}}
        const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

        resBody.errorMessage = {
          statusCode: error.statusCode || 500,
          body: errorMessage,
        };
      }

      return response.ok({
        body: resBody,
      });
    }
  );

  router.get(
    {
      path: ServiceEndpoints.GetIndexes,
      validate: {},
    },
    async (context, request, response) => {
      const params = {
        format: 'json',
      };
      const start = performance.now();
      try {
        const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'cat.indices',
          params
        );
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_INDEX,
          200,
          end - start
        );
        return response.ok({
          body: resp,
        });
      } catch (error) {
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_INDEX,
          error.statusCode,
          end - start
        );
        if (error.statusCode !== 404) console.error(error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  // Chain of Thought predict endpoint
  router.post(
    {
      path: ServiceEndpoints.ChainOfThought,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      let resBody: any = {};
      try {
        const resp = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'POST',
          path: `${MODEL_BASE_API}/${request.body?.model}/_predict?async=true`,
          body: request.body?.parameters,
        });
        resBody = resp;
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);

        // Template: Error: {{Error.type}} – {{Error.reason}}
        const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

        resBody.errorMessage = {
          statusCode: error.statusCode || 500,
          body: errorMessage,
        };
      }
      return response.ok({
        body: resBody,
      });
    }
  );

  // Get Task
  router.post(
    {
      path: ServiceEndpoints.GetTask,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      let resBody: any = {};
      try {
        const resp = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: `${TASK_BASE_API}/${request.body.taskID}`,
        });
        resBody = resp;
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);

        // Template: Error: {{Error.type}} – {{Error.reason}}
        const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

        resBody.errorMessage = {
          statusCode: error.statusCode || 500,
          body: errorMessage,
        };
      }
      return response.ok({
        body: resBody,
      });
    }
  );

  // Get Session
  router.post(
    {
      path: ServiceEndpoints.GetSessions,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      let resBody: any = {};
      const body = {
        query: {
          term: {
            session_id: request.body.id,
          },
        },
        sort: [
          {
            created_time: {
              order: request.body.order,
            },
          },
        ],
      };
      try {
        const resp = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: `${SESSIONS_INDEX}/_search`,
          body: JSON.stringify(body),
        });
        resBody = resp;
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);

        // Template: Error: {{Error.type}} – {{Error.reason}}
        const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

        resBody.errorMessage = {
          statusCode: error.statusCode || 500,
          body: errorMessage,
        };
      }
      return response.ok({
        body: resBody,
      });
    }
  );
}
