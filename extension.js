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

    // Map key names → actual accelerators and commands
    this._bindings = {
      'kb-1': '<Super>grave',
      'kb-2': '<Super>a',
      'kb-3': '<Super>n',
      'kb-4': '<Super>f',
      'kb-5': '<Super>c',
      'kb-6': '<Super>b',
      'kb-7': '<Super>v',
      'kb-8': '<Super>r',
      'kb-9': '<Super>m',
      'kb-10': '<Super>w',
      'kb-11': '<Super>Delete',
      'kb-12': '<Super>o',
      'kb-13': '<Super>q',
      'kb-14': 'Print',
      'kb-15': '<Super>p',
      'kb-16': '<Super>Tab',
      'kb-17': '<Super>x'
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
    journal(`Keybinding triggered: ${name} (${accel})`);

    // Map keybinding name → command string
    const commands = {
      'kb-1': 'align_windows',
      'kb-2': 'alacritty-keybinding',
      'kb-3': 'nemo-keybinding',
      'kb-4': 'fsearch-keybinding',
      'kb-5': 'codium-keybinding',
      'kb-6': 'firefox-keybinding',
      'kb-7': 'multimedia-keybinding',
      'kb-8': 'books-keybinding',
      'kb-9': 'toggle_mark_windows',
      'kb-10': 'rofi-windows-on-all-workspaces',
      'kb-11': 'close_other_windows',
      'kb-12': 'open-file-path',
      'kb-13': 'capture2text',
      'kb-14': 'rofi-screenshot',
      'kb-15': 'toggle_pin_windows',
      'kb-16': 'toggle-workspace',
      'kb-17': 'move-all-windows-to-respective-workspaces'
    };

    const cmd = commands[name];
    if (cmd) {
      try {
        GLib.spawn_command_line_async(cmd);
      } catch (e) {
        journal(`Failed to run command for ${name}: ${e}`, true);
      }
    }
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
