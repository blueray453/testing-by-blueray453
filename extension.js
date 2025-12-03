import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { setLogging, setLogFn, journal } from './utils.js'

export default class ExampleExtension extends Extension {
  enable() {
    setLogFn((msg, error = false) => {
      let level;
      if (error) {
        level = GLib.LogLevelFlags.LEVEL_CRITICAL;
      } else {
        level = GLib.LogLevelFlags.LEVEL_MESSAGE;
      }

      GLib.log_structured(
        'testing-by-blueray453',
        level,
        {
          MESSAGE: `${msg}`,
          SYSLOG_IDENTIFIER: 'testing-by-blueray453',
          CODE_FILE: GLib.filename_from_uri(import.meta.url)[0]
        }
      );
    });

    setLogging(true);

    // journalctl -f -o cat SYSLOG_IDENTIFIER=testing-by-blueray453
    journal(`Enabled`);

    this._settings = this.getSettings(
      'org.gnome.shell.extensions.testing-by-blueray453'
    );

    journal(`${this._settings}`);

    // List of dynamic keybindings (name → accelerator)
    this._bindings = {
      'kb-1': '<Super>T',
      'kb-2': '<Super>B',
      'kb-3': '<Super>C',
      'kb-4': '<Super>D',
      'kb-5': '<Super>E',
    };

    // Register all keybindings
    for (const [name, accel] of Object.entries(this._bindings)) {

      // Create setting value dynamically
      this._settings.set_strv(name, [accel]);

      // Register keybinding
      Main.wm.addKeybinding(
        name,
        this._settings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode.ALL,
        () => this._onKeyPress(name, accel)
      );
    }
  }

  _onKeyPress(name, accel) {
    journal(`Keybinding triggered`);
    journal(`Keybinding triggered: ${name} (${accel})`);
  }

  disable() {
    // Remove all keybindings
    if (this._bindings) {
      for (const name of Object.keys(this._bindings)) {
        Main.wm.removeKeybinding(name);
      }
    }
  }
}
