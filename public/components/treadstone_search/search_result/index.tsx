/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiPageContentBody,
  EuiFlexGroup,
  EuiTitle,
  EuiPanel,
  EuiText,
  EuiSpacer,
  EuiFlexItem,
} from '@elastic/eui';

import { CoreStart, ChromeBreadcrumb } from '../../../../../../src/core/public';
// import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
// import { SearchInputBar } from './search_components/search_bar';
import { ServiceEndpoints } from '../../../../common';
import { Header } from '../../common/header';
import { SearchResults, QueryError, QueryStringError } from '../../../types/index';
// import { ResultComponents } from './result_components/result_components';
import { useSearchRelevanceContext, initialQueryErrorState } from '../../../contexts';
import { SearchInputBar } from '../../query_compare/search_result/search_components/search_bar';
import { ChainOfThought } from '../result_component/chain_of_thought';

interface SearchResultProps {
  http: CoreStart['http'];
}

const defaultSettings = {
  parameters: {
    question:
      'I want to play Golf, can you suggest top 3 items I should prepare with possible recommendations?',
    verbose: true,
    'cot.stop_when_no_tool_found': true,
    max_iterations: 10,
    tools: ['SearchIndexTool', 'LanguageModelTool'],
    opensearch_indices: [
      'Index: amazon_products_truncate_tasb, Description: this OpenSearch index stroes all product data, Fields: text: contains product descriptions; text_embedding_tasb: stores embedding vectors of text field.  Hint: You should always use neural search to query this index, you can only tune the `query_text` value. For example: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf clubs","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}',
    ],
    'session_history.only_include_final_answer': true,
    'cot.step_interval_millis': 3000,
    examples: [
      '\nHuman: Question: I want to pick up Golf. Can you give me a list of 3 most important items that I need to buy with possible recommendations?\n\nAssistant:\nThought: This is a general question. I will use LanguageModelTool to get some general suggestions first.\nAction: LanguageModelTool\nAction Input: Suggest 3 most important items that I need to buy for playing Golf\nObservation: Here are the essential items you will need to buy to get started with golf:\n1. Golf clubs - You will need a set of golf clubs. For a beginner, a basic starter set from a brand like Callaway, TaylorMade or Cobra would be good to start with.\n2. Golf balls - You will need some golf balls to practice and play with. As a beginner, a cheaper ball like the Titleist DT Solo or Callaway Supersoft would be fine.\n3. Golf shoes - A essential item to provide traction and comfort. Look for shoes with water resistance and good grip. Popular golf shoe brands are FootJoy, Adidas, ECCO, etc.\n\nThought: I will use SearchIndexTool to search possible product recommendation for these items. Let\'s search Golf clubs first.\nAction: SearchIndexTool\nAction Input: Index: amazon_products_truncate_tasb, Query: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf clubs Callaway, TaylorMade or Cobra","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}\nObservation: {\'_id\': "nciyaoernqal3", \'text\': "Adams Tight Lies Full Set: Right, Graphite - Steel (Uniflex)Everything you need to get from tee to green is in this new set of Tight Lies. This new complete set of clubs is designed with game improvement features and technology for any golfer who wants to get more distance, accuracy and easy to hit playability from their golf clubs."}\n{\'_id\': "dafeniz132", \'text\': "15 Piece Ladies Womens Complete Golf Clubs Set Titanium Driver, S.S. Fairway, S.S. Hybrid, S.S. 6-PW Irons, Sand Wedge, Putter, Stand Bag, 3 H/C\'s Petite Size for Ladies 5\'3" and Below - Right HandWhether you\'re a beginner, an avid golfer, or if you can only get out to the course a few times per year, the Precise SL500 ladies club set is the perfect choice. The oversized clubheads are user-friendly and the off-set allows the beginning to intermediate golfer to get the ball in the air easier. Not only will this set improve your game, but it looks stylish as well."}\n\nThought: Now I know product recommendations for Golf clubs, Let\'s search Golf balls next.\nAction: SearchIndexTool\nAction Input: Index: amazon_products_truncate_tasb, Query: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf balls Titleist DT Solo or Callaway Supersoft","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}\nObservation: {\'_id\': "znoifaun12", \'text\': \'Assorted Designed Golf Balls (Soccer, Basketball, Football, Tennis, Baseball, 8-Ball) - 6 balls in a boxGreat Gift and Fun Collectible. Perfect for any Sports fans. 6 new golf balls in a box. These balls can be played in a real game of golf.\'}\n{\'id\': "adnfaou53", \'text\': "Trio Collection Novelty Golf Balls / US Flag / By ParagonThe Balls are designed to be seen. Designed to score. The unique designed golf balls have a 75 Compression Core designed for kids, women, seniors and cool weather play. Kids tend to love the unique design — they\'re easy to see and hard to lose!"}\n\nThought: Now I know product recommendations for Golf clubs and Golf balls, Let\'s search Golf shoes next.\nAction: SearchIndexTool\nAction Input: Index: amazon_products_truncate_tasb, Query: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf shoes FootJoy, Adidas, ECCO","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}\nObservation: {\'_id\': "cnoivahn12", \'text\': "Nke Air Rival Golf Shoe (White/Gunmetal/Metaillic Silver) 11 wideArrive in style with the Nike® Air Rival men\'s golf shoe, built to keep you comfortable on the greens. The stylish, water-resistant synthetic leather upper delivers moisture protection for sunny days and morning dew."}\n{\'_id\': "llaidfna43", \'text\': \'FootJoy HyperFlex White/Blue/Grey Closeout BOA Golf Shoes - 11.5 2E(W) USPro Am Golf has specialized in the sale of golfing products for over 35 years Our Products are designed to make sure that it helps you to improve the game Utmost care is taken to ensure that quality is maintained and hence the products are guaranteed of high quality and last long to be a part of your sport activities Specifications. Color WhiteGreyBlue. Width 115 Wide\'}\n\nThought: The returned results contain the right results. Now I know the final answer.\nFinal Answer: The essential items you will need to buy to get started with golf along with recommendations are: \n\n1. Golf clubs — document_id: nciyaoernqal3, Adams Tight Lies Full Set (11 Clubs + 1 Stand Bag) : Right, Graphite - Steel (Uniflex)Everything you need to get from tee to green is in this new set of Tight Lies. This new complete set of clubs is designed with game improvement features and technology for any golfer who wants to get more distance, accuracy and easy to hit playability from their golf clubs. The 460cc titanium club head will give you the confidence to drive the ball down the fairway. The clubs are built to deliver maximum distance and incredible forgiveness, even on off center shots. Tight Lies has allowed millions of golfers the joy and ease of hitting amazing second shots from the tee, in the fairway or out of the rough. Very easy to hit and designed for maximum distance with increased forgiveness. A superior option to long irons, this hybrid provides the distance of a wood with the accuracy and playability of an iron. It\'s forgiving, straighter and longer.\n\n2. Golf Balls - document_id: znoifaun12, Assorted Designed Golf Balls (Soccer, Basketball, Football, Tennis, Baseball, 8-Ball) - 6 balls in a boxGreat Gift and Fun Collectible. Perfect for any Sports fans. 6 new golf balls in a box. These balls can be played in a real game of golf.\n\n3. Golf Shoes — document_id: cnoivahn12, Nke Air Rival Golf Shoe (White/Gunmetal/Metaillic Silver) 11 wideArrive in style with the Nike® Air Rival men\'s golf shoe, built to keep you comfortable on the greens. The stylish, water-resistant synthetic leather upper delivers moisture protection for sunny days and morning dew. \n',
    ],
    stop_sequences: ['\nObservation:'],
    prompt_prefix:
      "\n\nHuman:You are an agent who helps make recommendations and buy things. Always try to use SearchIndexTool to search my data for product/buying recommendation. Don't cite the data/content from the example. Always cite document id from `_id` field and follow this format `document_id: {value}`. If you have multiple suggested item, you should search all of them one by one ",
    prompt_suffix: '\n\nAssistant:',
    'cot.action_regex': ['(?s)Action:\\s*(\\w+)\\s*\\nAction Input:\\s*((?:(?!\\nThought:).)*)'],
    'LanguageModelTool.prompt_prefix': '\n\nHuman:',
    'LanguageModelTool.prompt_suffix': '\n\nAssistant:',
    temperature: 0.1,
    'model.error_check': '$.message',
    top_k: 250,
    prompt:
      '${parameters.prompt_prefix}\nAnswer the following questions as best you can. Always try to answer question based on Context and Chat History. You should use Chat History as the chatting context to keep the conversation coherent and consistent.\n\n${parameters.chat_history}\n${parameters.context}\n\nYou have access to the following tools:\n\n${parameters.tool_descriptions}\n${parameters.opensearch_indices}\n${parameters.examples}\n\nUse the style of Thought, Action, Observation as demonstrated below to answer the questions (Do NOT add sequence number after Action and Action Input):\n\nHuman: Question: the input question you must answer\nAssistant:\nThought: you should always think about what to do. If you can find final answer from given Context, just give the final answer, NO need to run Action any more,\nAction: the action to take, should be one of [${parameters.tool_names}]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nBegin!\n\nHuman: Question: ${parameters.question}\n\nAssistant: ${parameters.scratchpad}\n${parameters.prompt_suffix}',
  },
  model: 'KJEXs4gBoH8KT0LIiTfg',
  index: 'amazon_products_truncate_tasb',
  regex: "'document_id: (\\w+)'",
};

export const SearchResult = ({ http }: SearchResultProps) => {
  const [query, setQuery] = useState<string>('');
  const [taskID, setTaskID] = useState<string>('');
  const [sessionID, setSessionID] = useState<string>('');
  const [initialState, setInitialState] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [settings, setSettings] = useState(defaultSettings);

  const onClickSearch = () => {
    let requestBody;
    if (sessionID.length !== 0) {
      requestBody = {
        parameters: {
          parameters: {
            ...settings.parameters,
            question: query,
            session_id: sessionID,
          },
        },
        model: settings.model,
      };
    } else {
      requestBody = {
        parameters: {
          parameters: {
            ...settings.parameters,
            question: query,
          },
        },
        model: settings.model,
      };
    }
    console.log(requestBody);
    setIsCompleted(false);
    if (query.length !== 0) {
      http
        .post(ServiceEndpoints.ChainOfThought, {
          body: JSON.stringify(requestBody),
        })
        .then((res) => {
          if ('body' in res && res.body.status === 'CREATED') {
            setTaskID(res.body.task_id);
          } else {
            console.log('TASK CREATION FAILED');
          }
        });
    }
  };

  const InitialState = () => {
    return (
      <EuiPanel
        hasBorder={false}
        hasShadow={false}
        grow={true}
        paddingSize="l"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <EuiText style={{ textAlign: 'center' }}>
          <h2>Enter a query to view results.</h2>
          <p>
            View search results with different algorithms powering search. Select an algorithm and
            then enter your query to view results.
          </p>
        </EuiText>
      </EuiPanel>
    );
  };

  useEffect(() => {
    if (taskID.length !== 0) {
      http
        .post(ServiceEndpoints.GetTask, {
          body: JSON.stringify({ taskID }),
        })
        .then((res) => {
          setSessionID(res.body.session_id);
          setInitialState(false);
        });
    }
  }, [taskID]);

  useEffect(() => {
    http
      .post(ServiceEndpoints.GetDocument, {
        body: JSON.stringify({ index: 'configurations', docID: 'cot_settings' }),
      })
      .then((res) => {
        if (JSON.stringify(settings) !== JSON.stringify(res._source)) {
          console.log('configurations settings and hardcoded settings are different');
          console.log('settings:', settings);
          console.log('saved settings:', res._source);
          setSettings(res._source);
        }
      });
  }, []);

  return (
    <>
      <Header page="aiSearch">
        <SearchInputBar
          searchBarValue={query}
          setSearchBarValue={setQuery}
          onClickSearch={onClickSearch}
        />
      </Header>
      <EuiPageContentBody className="search-relevance-flex">
        {!initialState && (
          <ChainOfThought
            query={query}
            initialState={initialState}
            isCompleted={isCompleted}
            setIsCompleted={setIsCompleted}
            sessionID={sessionID}
            taskID={taskID}
            http={http}
            index={settings.index}
            regex={settings.regex}
          />
        )}
        {initialState && <InitialState />}
      </EuiPageContentBody>
    </>
  );
};
