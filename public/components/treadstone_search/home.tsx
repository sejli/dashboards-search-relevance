/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { CoreStart, ChromeBreadcrumb } from '../../../../../src/core/public';
import '../../ace-themes/sql_console';
import { useSearchRelevanceContext } from '../../contexts';
import { DocumentsIndex } from '../../types/index';
import { ServiceEndpoints } from '../../../common';
import { Flyout } from '../common/flyout';
import { SearchResult } from './search_result/index';

interface SearchExplorerProps {
  parentBreadCrumbs: ChromeBreadcrumb[];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
  setToast: (title: string, color?: string, text?: any, side?: string) => void;
  chrome: CoreStart['chrome'];
}

export const Home = ({
  parentBreadCrumbs,
  notifications,
  http,
  navigation,
  setBreadcrumbs,
  setToast,
  chrome,
}: SearchExplorerProps) => {
  const { showFlyout } = useSearchRelevanceContext();

  useEffect(() => {
    setBreadcrumbs([...parentBreadCrumbs]);
  }, [setBreadcrumbs, parentBreadCrumbs]);

  return (
    <>
      <div className="osdOverviewWrapper">
        <SearchResult http={http} />
      </div>
      {showFlyout && <Flyout />}
    </>
  );
};
