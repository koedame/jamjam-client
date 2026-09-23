import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/building',
        'development/testing',
        'development/ci',
      ],
    },
    {
      type: 'category',
      label: 'UI Components',
      link: {
        type: 'doc',
        id: 'ui-components/index',
      },
      items: [
        'ui-components/connection-panel',
        'ui-components/mixer-panel',
        'ui-components/chat-panel',
        'ui-components/settings-panel',
        'ui-components/session-stats',
        'ui-components/connection-indicator',
      ],
    },
  ],
};

export default sidebars;
