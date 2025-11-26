import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { setLogging, setLogFn, journal } from './utils.js'

class SignalEmitter extends GObject.Object {

  static {
    GObject.registerClass({
      Signals: {
        'custom-clicked': {
          param_types: [
            GObject.TYPE_STRING,  // message
            GObject.TYPE_INT      // code
          ]
        }
      }
    }, this);
  }

  constructor() {
    super(); // ← THIS IS THE FIX - call parent constructor
  }

  triggerClick(message = "Default message", code = 0) {
    this.emit('custom-clicked', message, code);
  }
}

export default class MyExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._emitter = null;
    this._handlerId = null;
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

    this._emitter = new SignalEmitter();

    this._handlerId = this._emitter.connect('custom-clicked', (obj, msg, code) => {
      // Use journal instead of print for logging
      journal(`Signal object: ${obj}`);
      journal(`Signal received: ${msg}, code: ${code}`);
    });

    // Trigger clicks with proper parameters
    this._emitter.triggerClick("First click", 1);
    this._emitter.triggerClick("Second click", 2);
    this._emitter.triggerClick("Third click", 3);

  }

  disable() {
    if (this._emitter && this._handlerId) {
      this._emitter.disconnect(this._handlerId);
      this._emitter = null;
      this._handlerId = null;
    }

    journal(`Disabled`);
  }
}