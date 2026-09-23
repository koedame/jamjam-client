/**
 * Which screen a Tauri window shows is decided by the URL hash it was opened
 * with. The main screen connects to the signaling server as soon as it
 * mounts, so it must never mount in the settings window.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import i18n from './i18n';

const mainScreenMounted = vi.fn();

vi.mock('./screens/MainScreen', async () => {
  const React = await import('react');
  return {
    MainScreen: () => {
      React.useEffect(() => {
        mainScreenMounted();
      }, []);
      return <div>main screen</div>;
    },
  };
});

vi.mock('./screens/SettingsScreen', () => ({
  SettingsScreen: () => <div>settings screen</div>,
}));

const configGetLanguage = vi.fn();
vi.mock('./lib/tauri', () => ({
  windowOpenSettings: vi.fn(),
  configGetLanguage: (...args: unknown[]) => configGetLanguage(...args),
}));

// A window's language listener, captured so tests can simulate the settings
// window broadcasting a change without a real second window.
const languageChangedHandlers: Array<(event: { payload: string }) => void> = [];
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((eventName: string, handler: (event: { payload: string }) => void) => {
    if (eventName === 'i18n:language-changed') {
      languageChangedHandlers.push(handler);
    }
    return Promise.resolve(() => {});
  }),
}));

import App from './App';

describe('App', () => {
  beforeEach(() => {
    mainScreenMounted.mockClear();
    configGetLanguage.mockReset();
    configGetLanguage.mockResolvedValue(null);
    languageChangedHandlers.length = 0;
  });

  afterEach(async () => {
    window.location.hash = '';
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('the window is opened with the settings hash, the settings screen shows and the main screen never mounts', () => {
    window.location.hash = '#/settings';

    render(<App />);

    expect(screen.getByText('settings screen')).toBeInTheDocument();
    expect(mainScreenMounted).not.toHaveBeenCalled();
  });

  it('the window is opened without a hash, the main screen shows', () => {
    render(<App />);

    expect(screen.getByText('main screen')).toBeInTheDocument();
    expect(mainScreenMounted).toHaveBeenCalledTimes(1);
  });

  // Given the user chose a language in a previous session
  // When a window (re)starts
  // Then it shows the language saved in config, not whatever this webview's
  // own localStorage happens to have
  //
  // Verifies: REQ-I18N-104
  it('applies the language saved in config at startup', async () => {
    configGetLanguage.mockResolvedValue('ja');

    render(<App />);

    await waitFor(() => expect(i18n.language).toBe('ja'));
  });

  // Given no language has been saved yet (a fresh install)
  // When a window starts
  // Then it does not force a language - it leaves whatever this window
  // detected on its own (browser/localStorage) alone
  //
  // Verifies: REQ-I18N-101
  it('does not override the detected language when config has none saved', async () => {
    configGetLanguage.mockResolvedValue(null);
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

    render(<App />);
    await waitFor(() => expect(configGetLanguage).toHaveBeenCalled());
    // Give the resolved (null) promise's `.then()` a turn to run.
    await act(async () => {
      await Promise.resolve();
    });

    expect(changeLanguageSpy).not.toHaveBeenCalled();
    changeLanguageSpy.mockRestore();
  });

  // Given another window (settings) changed the language and broadcast it
  // When this window is already open
  // Then it switches immediately - before this was fixed, only the window
  // the user changed it in updated; every other open window kept showing
  // the old language until restarted.
  //
  // Verifies: REQ-I18N-102
  it('switches language immediately when another window broadcasts a change', async () => {
    render(<App />);

    await waitFor(() => expect(languageChangedHandlers.length).toBeGreaterThan(0));

    await act(async () => {
      languageChangedHandlers.forEach((handler) => handler({ payload: 'ja' }));
    });

    expect(i18n.language).toBe('ja');
  });
});
