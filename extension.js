import GLib from 'gi://GLib';

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { setLogging, setLogFn, journal } from './utils.js'

let myButton;


class MyPanelButton extends PanelMenu.Button {

  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(0.0, 'MyPanelButton');

    // Create an icon
    let hbox = new St.BoxLayout();
    this._icon = new St.Icon({ icon_name: 'system-run-symbolic', style_class: 'system-status-icon' });
    hbox.add_child(this._icon);
    this.add_child(hbox);

    const menuItem = new PopupMenu.PopupMenuItem('Item Label', {
      style_class: 'my-menu-item',
    });

    // Handle left and right click
    this.connect('button-press-event', (actor, event) => {
      let button = event.get_button();
      if (button === Clutter.BUTTON_PRIMARY) { // left click
        journal(`Left click detected!`);
        menuItem.setOrnament(PopupMenu.Ornament.CHECK);
      } else if (button === Clutter.BUTTON_SECONDARY) { // right click
        journal(`Right click detected!`);
      }
      return Clutter.EVENT_STOP; // prevent default
    });
  }
}

export default class MyExtension extends Extension {
  constructor(metadata) {
    super(metadata);
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

    myButton = new MyPanelButton();
    Main.panel.addToStatusArea('my-button', myButton);
  }

  disable() {
    if (myButton) {
      myButton.destroy();
      myButton = null;
    }
  }
}
