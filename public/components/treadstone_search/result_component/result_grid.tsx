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

import { IDocType, SearchResults, Document } from '../../../types/index';
// import { DocumentRank } from '../../../../contexts/utils';
import { useSearchRelevanceContext } from '../../../contexts';

interface ResultGridComponentProps {
  queryResult: any;
}

export const ResultGridComponent = ({ queryResult }: ResultGridComponentProps) => {
  const getDlTmpl = (doc: any) => {
    return (
      <div className="truncate-by-height">
        <span>
          <dl className="source truncate-by-height">
            {_.toPairs(doc).map((entry: string[]) => {
              return (
                <>
                  <dt>{`${entry[0]}:`}</dt>
                  <dd>
                    <span>{_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} </span>
                  </dd>
                </>
              );
            })}
          </dl>
        </span>
      </div>
    );
  };

  const gtTdTmpl = (conf: { clasName: string; content: React.ReactDOM | string}) => {
    const { clsName, content } = conf;
    return (
      <td key={uniqueId('datagrid-cell-')} className={clsName} style={{ width: '80%' }}>
        {typeof content === 'boolean' ? String(content) : content}
      </td>
    );
  };
};
