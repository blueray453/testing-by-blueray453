import Meta from 'gi://Meta';
import St from 'gi://St';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GObject from 'gi://GObject';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import { setLogging, setLogFn, journal } from './utils.js'

const Display = global.get_display();
const WorkspaceManager = global.get_workspace_manager();

export default class MyPanelButton extends PanelMenu.Button {

  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(0.0, 'MyPanelButton');
    this._icon = new St.Icon({ icon_name: 'system-run-symbolic', style_class: 'system-status-icon' });
    this.add_child(this._icon);
  }

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

    this.connect('button-press-event', (actor, event) => {
      this._logWindowInfo();
    });

    // Add button to the top-right UI for testing
    // Main.layoutManager.addChrome(button);
    // Main.panel._centerBox.insert_child_at_index(container, 0);
    Main.panel.addToStatusArea('my-button', this);
  }

  _logWindowInfo(){
    let windows_by_stacking = Display.sort_windows_by_stacking(global.get_window_actors().map(actor => actor.meta_window).filter(win => win.get_window_type() === Meta.WindowType.NORMAL));

    journal('windows_by_stacking:');
    windows_by_stacking.forEach(win => journal(`${win.get_title()}`));

    let tab_list = Display.get_tab_list(0, WorkspaceManager.get_active_workspace());

    tab_list.forEach(win => journal(`${win.get_title()}`));

    let window_group = global.get_window_group();
    journal('window_group:', window_group);

    let top_window_group = global.get_top_window_group();
    journal('top_window_group:', top_window_group);
  }

  disable() {
    journal('Extension disabled: all keybindings removed and settings cleared.');
  }
}
