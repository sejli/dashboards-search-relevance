/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

import { IDocType, SearchResults, Document } from '../../../types/index';
// import { DocumentRank } from '../../../../contexts/utils';
import { useSearchRelevanceContext } from '../../../contexts';

interface ResultGridComponentProps {
  docIds: any;
  http: CoreStart['http'];
  index: string;
}

export const ResultGridComponent = ({ docIds, http, index }: ResultGridComponentProps) => {
  const [documents, setDocuments] = useState<any[]>([]);

  const getDlTmpl = (doc: any) => {
    return (
      <div>
        <span>
          <dl className="source">
            {_.toPairs(doc).map((entry: string[]) => {
              if (entry[0] === 'text') {
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
      <td key={uniqueId('datagrid-cell-')} className={clsName}>
        {typeof content === 'boolean' ? String(content) : content}
      </td>
    );
  };

  const getTds = (document: any) => {
    const cols = [];
    const fieldClsName = 'eui-textBreakAll eui-textBreakWord';

    const imageFromSource = _.toPairs(document._source).find((entry) => entry[0] === 'imageURL');
    const imageFromFields = _.toPairs(document.fields).find((entry) => entry[0] === 'imageURL');
    const imageSource = imageFromSource
      ? imageFromSource[1][0]
      : imageFromFields
      ? imageFromFields[1][0][0]
      : null;
    const image = (
      <>
        <td>
          <div
            style={{
              width: '150px',
              height: '150px',
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
                style={{ maxWidth: '150px', maxHeight: '150px' }}
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

    const _sourceLikeDOM = getDlTmpl(document._source);
    cols.push(
      getTdTmpl({
        clsName: fieldClsName,
        content: _sourceLikeDOM,
      })
    );
    return cols;
  };

  const resultGrid = () => {
    return (
      <>
        {documents.map((document: any) => {
          return (
            <tr className="osdDocTable__row" key={uniqueId('documentId-')}>
              {getTds(document)}
            </tr>
          );
        })}
      </>
    );
  };

  useEffect(() => {
    docIds.forEach(async (id: string) => {
      await http
        .post(ServiceEndpoints.GetDocument, {
          body: JSON.stringify({ index, docID: id }),
        })
        .then((res) => {
          setDocuments((prev) => [...prev, res]);
        });
    });
  }, [docIds]);

  return (
    <div className="dscTable dscTableFixedScroll">
      <table
        className="osd-table table"
        data-test-subj="docTable"
        style={{ width: '75%', marginLeft: '15px' }}
      >
        <tbody>{resultGrid()}</tbody>
      </table>
    </div>
  );
};
