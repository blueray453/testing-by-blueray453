import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let button;
let leftMenu;
let rightMenu;
let manager;

export default class Extension {
  enable() {
    // -------------------------
    // Create the panel button
    // -------------------------
    button = new St.Button({
      label: 'Hello',
      style_class: 'panel-button',
      reactive: true,
      can_focus: true,
      track_hover: true,
    });

    Main.panel._centerBox.insert_child_at_index(button, 0);

    // -------------------------
    // Popup menu manager
    // -------------------------
    manager = new PopupMenu.PopupMenuManager(button);

    // -------------------------
    // Left-click menu
    // -------------------------
    leftMenu = new PopupMenu.PopupMenu(button, 0.5, St.Side.TOP);
    Main.layoutManager.uiGroup.add_child(leftMenu.actor);
    manager.addMenu(leftMenu);

    let leftItemA = new PopupMenu.PopupMenuItem('Left Option A');
    leftItemA.connect('activate', () => Main.notify('Left Menu', 'A selected'));
    leftMenu.addMenuItem(leftItemA);

    let leftItemB = new PopupMenu.PopupMenuItem('Left Option B');
    leftItemB.connect('activate', () => Main.notify('Left Menu', 'B selected'));
    leftMenu.addMenuItem(leftItemB);

    // -------------------------
    // Right-click menu
    // -------------------------
    rightMenu = new PopupMenu.PopupMenu(button, 0.5, St.Side.TOP);
    Main.layoutManager.uiGroup.add_child(rightMenu.actor);
    manager.addMenu(rightMenu);

    let rightItemX = new PopupMenu.PopupMenuItem('Right Option X');
    rightItemX.connect('activate', () => Main.notify('Right Menu', 'X selected'));
    rightMenu.addMenuItem(rightItemX);

    let rightItemY = new PopupMenu.PopupMenuItem('Right Option Y');
    rightItemY.connect('activate', () => Main.notify('Right Menu', 'Y selected'));
    rightMenu.addMenuItem(rightItemY);

    // -------------------------
    // Handle clicks
    // -------------------------
    button.connect('button-press-event', (actor, event) => {
      const btn = event.get_button();

      // Close both menus before opening the one you want
      leftMenu.close();
      rightMenu.close();

      if (btn === 1) {
        leftMenu.open();
        return Clutter.EVENT_STOP; // stop propagation
      }
      if (btn === 3) {
        rightMenu.open();
        return Clutter.EVENT_STOP; // stop propagation
      }

      return Clutter.EVENT_PROPAGATE;
    });
  }

  disable() {
    if (manager) {
      manager.removeMenu(leftMenu);
      manager.removeMenu(rightMenu);
      manager = null;
    }

    if (leftMenu) {
      leftMenu.destroy();
      leftMenu = null;
    }

    if (rightMenu) {
      rightMenu.destroy();
      rightMenu = null;
    }

    if (button) {
      button.destroy();
      button = null;
    }
  }
}
