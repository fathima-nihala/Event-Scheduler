import { Helmet } from 'react-helmet-async';

import { CONFIG } from '../config-global';

import { TaskView } from '../sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Blog - ${CONFIG.appName}`}</title>
      </Helmet>

      <TaskView />
    </>
  );
}
