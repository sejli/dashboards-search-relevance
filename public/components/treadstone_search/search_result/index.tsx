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

export const SearchResult = ({ http }: SearchResultProps) => {
  const [query, setQuery] = useState<string>('');
  const [taskID, setTaskID] = useState<string>('');
  const [sessionID, setSessionID] = useState<string>('');
  const [initialState, setInitialState] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [index, setIndex] = useState<string>('amazon_products_truncate_tasb');
  const [prompt, setPrompt] = useState<string>(
    'You are an agent who helps make recommendations and buy things. Please include the document IDs and text of the recommended items in the final answer.'
  );
  const [temperature, setTemperature] = useState<number>(0.0);

  const onClickSearch = () => {
    const parameters = {
      parameters: {
        question: query,
        verbose: true,
        max_iterations: 10,
        temperature,
        prompt_prefix: prompt,
        tools: ['LanguageModelTool', 'SearchIndexTool'],
        examples: [
          `\nHuman: Question: I want to pick up Golf. Can you give me a list of 3 most important items that I need to buy with possible recommendations?\n      \nAssistant: \n\nThought: This is a general question. I will use LanguageModelTool to get some general suggestions first.\nAction: LanguageModelTool\nAction Input: Suggest 3 most important items that I need to buy for playing Golf\nObservation: Here are the essential items you will need to buy to get started with golf:\n1. Golf clubs - You will need a set of golf clubs including woods (for longer shots), irons (for shorter shots), and a putter (for putting on the green). For a beginner, a basic starter set from a brand like Callaway, TaylorMade or Cobra would be good to start with.\n2. Golf balls - You will need some golf balls to practice and play with. As a beginner, a cheaper ball like the Titleist DT Solo or Callaway Supersoft would be fine. Comfortable clothes - You need loose, comfortable clothes like golf pants or shorts, golf shirts, socks, and golf shoes. It\'s also a good idea to dress in layers for different weather conditions.\n3. Golf shoes - A essential item to provide traction and comfort. Look for shoes with water resistance and good grip. Popular golf shoe brands are FootJoy, Adidas, ECCO, etc.\n\nThought: I will use SearchIndexTool to search possible product recommendation for these items. Let\'s search Golf clubs first.\nAction: SearchIndexTool\nAction Input: Index: ${index}, Query: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf clubs","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}\nObservation: Golf clubs search results are, {\'document_id\': "nciyaoernqal3", \'text\': "Adams Tight Lies Full Set (11 Clubs + 1 Stand Bag) : Right, Graphite - Steel (Uniflex)Everything you need to get from tee to green is in this new set of Tight Lies. This new complete set of clubs is designed with game improvement features and technology for any golfer who wants to get more distance, accuracy and easy to hit playability from their golf clubs. The 460cc titanium club head will give you the confidence to drive the ball down the fairway. The clubs are built to deliver maximum distance and incredible forgiveness, even on off center shots. Tight Lies has allowed millions of golfers the joy and ease of hitting amazing second shots from the tee, in the fairway or out of the rough. Very easy to hit and designed for maximum distance with increased forgiveness. A superior option to long irons, this hybrid provides the distance of a wood with the accuracy and playability of an iron. It\'s forgiving, straighter and longer."} {\'document_id\': "dafeniz132", \'text\': "15 Piece Ladies Womens Complete Golf Clubs Set Titanium Driver, S.S. Fairway, S.S. Hybrid, S.S. 6-PW Irons, Sand Wedge, Putter, Stand Bag, 3 H/C\'s Petite Size for Ladies 5\'3" and Below - Right HandWhether you\'re a beginner, an avid golfer, or if you can only get out to the course a few times per year, the Precise SL500 ladies club set is the perfect choice. The oversized clubheads are user-friendly and the off-set allows the beginning to intermediate golfer to get the ball in the air easier. Not only will this set improve your game, but it looks stylish as well."}\n\nThought: Now I know product recommendations for Golf clubs, Let\'s search Golf balls next.\nAction: SearchIndexTool\nAction Input: Index: ${index}, Query: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf balls","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}\nObservation: Golf balls results are, {\'document_id\': "znoifaun12", \'text\': \'Assorted Designed Golf Balls (Soccer, Basketball, Football, Tennis, Baseball, 8-Ball) - 6 balls in a boxGreat Gift and Fun Collectible. Perfect for any Sports fans. 6 new golf balls in a box. These balls can be played in a real game of golf.\'} {\'document_id\': "adnfaou53", \'text\': "Trio Collection Novelty Golf Balls / US Flag / By ParagonThe Balls are designed to be seen. Designed to score. The unique designed golf balls have a 75 Compression Core designed for kids, women, seniors and cool weather play. Kids tend to love the unique design — they\'re easy to see and hard to lose!"}\n\nThought: Now I know product recommendations for Golf clubs and Golf balls, Let\'s search Golf shoes next.\nAction: SearchIndexTool\nAction Input: Index: ${index}, Query: {"query":{"neural":{"text_embedding_tasb":{"query_text":"Golf shoes","model_id":"qDWgsogBj2I2ZvX3S3yJ","k":10}}},"size":"3","_source":["text"]}\nObservation: Golf shoes results are, {\'document_id\': "cnoivahn12", \'text\': "Nke Air Rival Golf Shoe (White/Gunmetal/Metaillic Silver) 11 wideArrive in style with the Nike® Air Rival men\'s golf shoe, built to keep you comfortable on the greens. The stylish, water-resistant synthetic leather upper delivers moisture protection for sunny days and morning dew."} {\'document_id\': "llaidfna43", \'text\': \'FootJoy HyperFlex White/Blue/Grey Closeout BOA Golf Shoes - 11.5 2E(W) USPro Am Golf has specialized in the sale of golfing products for over 35 years Our Products are designed to make sure that it helps you to improve the game Utmost care is taken to ensure that quality is maintained and hence the products are guaranteed of high quality and last long to be a part of your sport activities Specifications. Color WhiteGreyBlue. Width 115 Wide\'}\n\nThought: The returned results contain the right results. Now I know the final answer:\nThe essential items you will need to buy to get started with golf along with recommendations are: \n1. Golf clubs — document_id: nciyaoernqal3, Adams Tight Lies Full Set (11 Clubs + 1 Stand Bag) : Right, Graphite - Steel (Uniflex)Everything you need to get from tee to green is in this new set of Tight Lies. This new complete set of clubs is designed with game improvement features and technology for any golfer who wants to get more distance, accuracy and easy to hit playability from their golf clubs. The 460cc titanium club head will give you the confidence to drive the ball down the fairway. The clubs are built to deliver maximum distance and incredible forgiveness, even on off center shots. Tight Lies has allowed millions of golfers the joy and ease of hitting amazing second shots from the tee, in the fairway or out of the rough. Very easy to hit and designed for maximum distance with increased forgiveness. A superior option to long irons, this hybrid provides the distance of a wood with the accuracy and playability of an iron. It\'s forgiving, straighter and longer.\n\n2. Golf Balls - document_id: znoifaun12, Assorted Designed Golf Balls (Soccer, Basketball, Football, Tennis, Baseball, 8-Ball) - 6 balls in a boxGreat Gift and Fun Collectible. Perfect for any Sports fans. 6 new golf balls in a box. These balls can be played in a real game of golf.\n\n3. Golf Shoes — document_id: cnoivahn12, Nke Air Rival Golf Shoe (White/Gunmetal/Metaillic Silver) 11 wideArrive in style with the Nike® Air Rival men\'s golf shoe, built to keep you comfortable on the greens. The stylish, water-resistant synthetic leather upper delivers moisture protection for sunny days and morning dew. \n`,
        ],
      },
    };
    if (sessionID.length !== 0) {
      parameters.parameters.session_id = sessionID;
      parameters.parameters.session_history = { only_include_final_answer: true };
    }
    console.log(parameters);
    const requestBody = {
      model: 'KJEXs4gBoH8KT0LIiTfg',
      parameters,
    };
    setIsCompleted(false);
    if (query.length !== 0) {
      http
        .post(ServiceEndpoints.ChainOfThought, {
          body: JSON.stringify(requestBody),
        })
        .then((res) => {
          if (res.body.status === 'CREATED') {
            setTaskID(res.body.task_id);
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
        if (res._source.index && res._source.index !== index) {
          setIndex(res._source.index);
        }
        if (res._source.prompt && res._source.prompt !== prompt) {
          setPrompt(res._source.prompt);
        }
        if (res._source.temperature && res._source.temperature !== temperature) {
          setTemperature(res._source.temperature);
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
            index={index}
          />
        )}
        {initialState && <InitialState />}
      </EuiPageContentBody>
    </>
  );
};
