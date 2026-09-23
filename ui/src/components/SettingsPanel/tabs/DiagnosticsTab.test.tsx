/**
 * DiagnosticsTab log file section (ADR-036)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DiagnosticsTab } from './DiagnosticsTab';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
  }),
}));

describe('DiagnosticsTab log file section', () => {
  // Verifies: REQ-GUI-020
  it('the user presses the button, the handler runs', () => {
    const onOpenLogFolder = vi.fn();
    render(<DiagnosticsTab state="idle" onOpenLogFolder={onOpenLogFolder} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open log folder' }));

    expect(onOpenLogFolder).toHaveBeenCalledTimes(1);
  });

  // Verifies: REQ-GUI-020
  it('the folder could not be opened, the reason with its path is shown as an alert', () => {
    render(
      <DiagnosticsTab
        state="idle"
        onOpenLogFolder={() => {}}
        logFolderError="Could not open the log folder /logs/me.koeda.jamjam: No such file"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('/logs/me.koeda.jamjam');
  });

  // Verifies: REQ-GUI-020
  it('the folder was opened, its path is shown under the button', () => {
    render(
      <DiagnosticsTab state="idle" onOpenLogFolder={() => {}} logFolder="/logs/me.koeda.jamjam" />
    );

    expect(screen.getByText('/logs/me.koeda.jamjam')).toBeInTheDocument();
  });

  it('no handler is given, the section is not shown', () => {
    render(<DiagnosticsTab state="idle" />);

    expect(screen.queryByTestId('diagnostics-log-file')).not.toBeInTheDocument();
  });
});
