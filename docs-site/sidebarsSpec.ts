import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  specSidebar: [
    'README',
    'architecture',
    {
      type: 'category',
      label: 'API Specifications',
      items: [
        'api/audio_engine',
        'api/network',
        'api/signaling',
        'api/i18n',
        'api/device-identity',
        'api/e2e-control',
      ],
    },
    {
      type: 'category',
      label: 'ADR (Design Decisions)',
      items: [
        'adr/ADR-001-language-rust',
        'adr/ADR-002-network-protocol',
        'adr/ADR-003-audio-codec',
        'adr/ADR-004-gui-framework',
        'adr/ADR-005-no-audio-processing',
        'adr/ADR-006-fec-strategy',
        'adr/ADR-007-i18n-library',
        'adr/ADR-008-zero-latency-mode',
        'adr/ADR-009-tauri-build-commands',
        'adr/ADR-011-core-library-architecture',
        'adr/ADR-012-code-signing-strategy',
        'adr/ADR-013-sample-rate-strategy',
        'adr/ADR-014-claude-code-config-structure',
        'adr/ADR-016-remove-host-privilege-concept',
        'adr/ADR-018-iterative-v-model-traceability',
        'adr/ADR-019-preset-latency-budget',
        'adr/ADR-020-jitter-buffer-wiring',
        'adr/ADR-021-preset-codec-and-fec',
        'adr/ADR-022-reconnection-and-narrowband-scope',
        'adr/ADR-023-drop-phase-as-identifier',
        'adr/ADR-024-device-identity-instead-of-accounts',
        'adr/ADR-025-gui-e2e-control-channel',
        'adr/ADR-026-gui-audio-path',
        'adr/ADR-027-cli-scope',
        'adr/ADR-028-single-stage-playout',
      ],
    },
  ],
};

export default sidebars;
