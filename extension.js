import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { setLogging, setLogFn, journal } from './utils.js'

export default class NotificationThemeExtension extends Extension {
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

    let window_group = global.get_window_group();

    // window_group.get_children().forEach((child, i) => {
    //   journal(`Child ${i}: ${child}`);
    // });

    // window_group.get_children().forEach((actor, i) => {
    //   let metaWin = actor.get_meta_window?.();   // optional chaining
    //   if (metaWin) {
    //     journal(`Child ${i}: ${metaWin.get_window_type()}`);
    //   }

    // });

    window_group.get_children().forEach(function (actor, i) {
      if (typeof actor.get_meta_window === 'function') {
        let metaWin = actor.get_meta_window();

        // Single if statement checking both
        if (metaWin && metaWin.get_window_type() === 0) {
          let wmClass = (typeof metaWin.get_wm_class === 'function') ? metaWin.get_wm_class() : 'N/A';
          journal(`Child ${i}: ${wmClass}`);
        }
      }
    });
  }

  disable() {

  }
}
