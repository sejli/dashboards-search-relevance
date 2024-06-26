/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButtonIcon,
  EuiLink,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiIcon,
  EuiIconTip,
  EuiImage,
  EuiComment,
  EuiCommentList,
} from '@elastic/eui';
import _, { uniqueId } from 'lodash';

import { IDocType, SearchResults, Document } from '../../../../types/index';
import { DocumentRank } from '../../../../contexts/utils';
import { useSearchRelevanceContext } from '../../../../contexts';

import './result_grid.scss';

interface ResultGridComponentProps {
  comparedDocumentsRank: DocumentRank;
  queryResult: SearchResults;
  resultNumber: number;
  hasSummary: boolean;
}

export const ResultGridComponent = ({
  comparedDocumentsRank,
  queryResult,
  resultNumber,
  hasSummary,
}: ResultGridComponentProps) => {
  const { selectedIndex1, selectedIndex2, pipeline1, pipeline2 } = useSearchRelevanceContext();

  const getExpColapTd = () => {
    return (
      <td className="osdDocTableCell__toggleDetails" key={uniqueId('grid-td-')}>
        <EuiButtonIcon className="euiButtonIcon euiButtonIcon--text" iconType="arrowLeft" />
      </td>
    );
  };

  const getDlTmpl = (doc: IDocType) => {
    return (
      <div className="truncate-by-height">
        <span>
          <dl className="source truncate-by-height">
            {_.toPairs(doc).map((entry: string[]) => {
              if (entry[0] !== 'image') {
                return (
                  <>
                    <dt>{`${entry[0]}:`}</dt>
                    <dd>
                      <span>{_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} </span>
                    </dd>
                  </>
                );
              }
            })}
          </dl>
        </span>
      </div>
    );
  };

  const getTdTmpl = (conf: { clsName: string; content: React.ReactDOM | string }) => {
    const { clsName, content } = conf;
    return (
      <td key={uniqueId('datagrid-cell-')} className={clsName} style={{ width: '80%' }}>
        {typeof content === 'boolean' ? String(content) : content}
      </td>
    );
  };

  const getRankComparison = (documentId: string, documentRank: number) => {
    const comparedRank = comparedDocumentsRank[documentId];

    // No match result in comparison set
    if (typeof comparedRank !== 'number') {
      return (
        <EuiText>
          <span
            style={{ color: '#69707D', fontSize: '12px', fontWeight: '400', lineHeight: '21px' }}
          >
            Not applicable
          </span>{' '}
          <EuiIconTip
            aria-label="IconTip"
            size="m"
            type="questionInCircle"
            color="#343741"
            content={
              selectedIndex1 === selectedIndex2 ? (
                <span>
                  Not in <strong>Results {resultNumber === 1 ? 2 : 1}</strong>
                </span>
              ) : (
                <span>No cross-references when using different indexes</span>
              )
            }
          />
        </EuiText>
      );
    }

    const rankDifference = documentRank - comparedRank;
    if (rankDifference === 0) {
      return (
        <EuiText>
          <span className="comparison-rank " style={{ color: '#343741' }}>
            No change
          </span>
        </EuiText>
      );
    } else if (rankDifference < 0) {
      return (
        <EuiText>
          <span className="comparison-rank " style={{ color: '#017D73' }}>
            <EuiIcon type="sortUp" /> Up {Math.abs(rankDifference)}
          </span>
        </EuiText>
      );
    } else if (rankDifference > 0) {
      return (
        <EuiText>
          <span className="comparison-rank " style={{ color: '#BD271E' }}>
            <EuiIcon type="sortDown" /> Down {rankDifference}
          </span>
        </EuiText>
      );
    }
  };

  const getRankColumn = (documentId: string, documentRank: number) => {
    return (
      <td key={`${resultNumber}-${documentId}`} style={{ width: '10%' }}>
        <EuiFlexGroup style={{ width: '150px' }} direction="column" justifyContent="center">
          <EuiFlexItem>
            <EuiTitle size="xs">
              <h1
                style={{
                  fontWeight: '300',
                  fontSize: '27px',
                  lineHeight: '36px',
                }}
              >
                {documentRank}
              </h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>{getRankComparison(documentId, documentRank)}</EuiFlexItem>
        </EuiFlexGroup>
      </td>
    );
  };

  const getTds = (document: Document, documentRank: number) => {
    const cols = [];
    const fieldClsName = 'eui-textBreakAll eui-textBreakWord';
    const timestampClsName = 'eui-textNoWrap';

    // Get rank index column
    cols.push(getRankColumn(document._id, documentRank));

    const imageFromSource = _.toPairs(document._source).find((entry) => entry[0] === 'image');
    const imageFromFields = _.toPairs(document.fields).find((entry) => entry[0] === 'image');
    const imageSource = imageFromSource
      ? imageFromSource[1]
      : imageFromFields
      ? imageFromFields[1][0]
      : null;
    const image = (
      <>
        <td>
          <div
            style={{
              width: '95px',
              height: '95px',
              backgroundColor: imageSource ? '' : '#d4dae5',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            {imageSource ? (
              <EuiImage
                src={imageSource}
                alt=""
                style={{ maxWidth: '95px', maxHeight: '95px' }}
                allowFullScreen
                hasShadow
              />
            ) : (
              <EuiIcon type="image" size="xl" color="#535966" />
            )}
          </div>
        </td>
      </>
    );
    cols.push(image);

    // No field is selected
    const _sourceLikeDOM = getDlTmpl(document._source);
    cols.push(
      getTdTmpl({
        clsName: fieldClsName,
        content: _sourceLikeDOM,
      })
    );

    // // Add detail toggling column
    // // cols.unshift(getExpColapTd());
    // cols.push(getExpColapTd());

    return cols;
  };

  const resultGrid = () => {
    return (
      <>
        {queryResult.hits.hits.map((document: Document, documentRank: number) => {
          return (
            <tr className="osdDocTable__row" key={uniqueId('documentId-')}>
              {getTds(document, documentRank + 1)}
            </tr>
          );
        })}
      </>
    );
  };

  // useEffect(() => {
  //   console.log('query result changed');
  //   if (!_.isEmpty(queryResult))
  //     setResultGrid(
  //       queryResult.hits.hits.map((doc: any, id: number) => {
  //         return (
  //           <>
  //             <tr className="osdDocTable__row">{getTds(doc._source)}</tr>
  //           </>
  //         );
  //       })
  //     );
  // }, [queryResult]);

  const summaries: any[] = [];
  if (queryResult?.generatedText) {
    for (let i = 0; i < queryResult?.generatedText.length; i++) {
      const configurationType = queryResult?.generatedText[i].processorTag;
      let header;
      switch (configurationType) {
        case 'summary': {
          header = 'Search Summarization';
          break;
        }
        case 'Q&A': {
          header = 'Question and Answer';
          break;
        }
      }
      const summary = (
        <EuiComment username="" event={<strong>{header}</strong>} timelineIcon="logoOpenSearch">
          <EuiText size="s">
            <p>{queryResult?.generatedText[i].value}</p>
          </EuiText>
        </EuiComment>
      );
      summaries.push(summary);
    }
  }

  return (
    <div className="dscTable dscTableFixedScroll">
      {hasSummary && (
        <div style={{ height: '120px', overflowY: 'auto' }}>
          <EuiCommentList>{summaries}</EuiCommentList>
        </div>
      )}
      <table className="osd-table table" data-test-subj="docTable">
        <tbody>{resultGrid()}</tbody>
      </table>
    </div>
  );
};
