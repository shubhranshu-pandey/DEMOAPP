

(function () {
  "use strict";

  console.log("[VPL Bypass] Loading Windows-compatible version...");


  window.alert = function (msg) {
    console.log("[VPL Bypass] Blocked alert:", msg);
    return undefined;
  };

  window.confirm = function (msg) {
    console.log("[VPL Bypass] Blocked confirm:", msg);
    return true;
  };

  window.prompt = function (msg) {
    console.log("[VPL Bypass] Blocked prompt:", msg);
    return null;
  };

  
  window.restrictedPaste = function () {
    console.log("[VPL Bypass] Bypassed restrictedPaste");
    return true;
  };

  
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    const blockedEvents = [
      "paste",
      "copy",
      "cut",
      "contextmenu",
      "selectstart",
      "mousedown",
      "mouseup",
      "keydown",
      "keypress",
    ];

    if (blockedEvents.includes(type)) {
      console.log("[VPL Bypass] Blocked event listener:", type);
      return; // Don't add the listener
    }

    return originalAddEventListener.call(this, type, listener, options);
  };

  // ============================================
  // FORCE ENABLE CLIPBOARD OPERATIONS
  // ============================================

  // Add our own listeners that always allow operations
  document.addEventListener(
    "paste",
    function (e) {
      e.stopImmediatePropagation();
      console.log("[VPL Bypass] Paste allowed");
    },
    true
  );

  document.addEventListener(
    "copy",
    function (e) {
      e.stopImmediatePropagation();
      console.log("[VPL Bypass] Copy allowed");
    },
    true
  );

  document.addEventListener(
    "cut",
    function (e) {
      e.stopImmediatePropagation();
      console.log("[VPL Bypass] Cut allowed");
    },
    true
  );

  document.addEventListener(
    "contextmenu",
    function (e) {
      e.stopImmediatePropagation();
      console.log("[VPL Bypass] Right-click allowed");
    },
    true
  );

  // Force keyboard shortcuts to work
  document.addEventListener(
    "keydown",
    function (e) {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (
        isCtrl &&
        (key === "c" || key === "v" || key === "x" || key === "a")
      ) {
        e.stopImmediatePropagation();
        console.log("[VPL Bypass] Keyboard shortcut allowed:", key);
      }
    },
    true
  );

  // ============================================
  // CLEAR ALL INLINE HANDLERS
  // ============================================

  function clearAllHandlers() {
    try {
      const elements = document.querySelectorAll("*");
      elements.forEach(function (el) {
        el.onpaste = null;
        el.oncopy = null;
        el.oncut = null;
        el.oncontextmenu = null;
        el.onselectstart = null;
        el.onmousedown = null;
        el.onmouseup = null;
        el.onkeydown = null;
        el.onkeypress = null;
      });
    } catch (e) {
      console.log("[VPL Bypass] Error clearing handlers:", e);
    }
  }

  // ============================================
  // DESTROY ALL RESTRICTION DIALOGS
  // ============================================

  function destroyRestrictionDialogs() {
    try {
      const selectors = [
        ".ui-dialog",
        ".modal",
        '[role="dialog"]',
        '[role="alertdialog"]',
        ".popup",
        ".alert",
        ".notification",
        ".toast",
        ".message",
      ];

      selectors.forEach(function (selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function (el) {
          const text = (el.textContent || "").toLowerCase();

          if (
            text.includes("action") ||
            text.includes("restricted") ||
            text.includes("not allowed") ||
            text.includes("paste") ||
            text.includes("copy")
          ) {
            console.log(
              "[VPL Bypass] Destroyed dialog:",
              text.substring(0, 50)
            );
            el.remove();

            // Remove overlays too
            document
              .querySelectorAll(".ui-widget-overlay, .modal-backdrop")
              .forEach(function (overlay) {
                overlay.remove();
              });
          }
        });
      });
    } catch (e) {
      console.log("[VPL Bypass] Error destroying dialogs:", e);
    }
  }

  // ============================================
  // BLOCK JQUERY DIALOGS
  // ============================================

  function blockJQueryDialogs() {
    try {
      if (window.jQuery || window.$) {
        const $ = window.jQuery || window.$;

        if ($.fn && $.fn.dialog) {
          $.fn.dialog = function (options) {
            console.log("[VPL Bypass] Blocked jQuery dialog");
            return this; // Don't show dialog
          };
        }

        // Block other jQuery notification methods
        if ($.notify) {
          $.notify = function () {
            console.log("[VPL Bypass] Blocked jQuery notify");
          };
        }

        if ($.alert) {
          $.alert = function () {
            console.log("[VPL Bypass] Blocked jQuery alert");
          };
        }
      }
    } catch (e) {
      console.log("[VPL Bypass] Error blocking jQuery:", e);
    }
  }

  // ============================================
  // BLOCK VPL_UTIL
  // ============================================

  function blockVPLUtil() {
    try {
      if (window.VPL_Util) {
        window.VPL_Util.showMessage = function () {
          console.log("[VPL Bypass] Blocked VPL_Util.showMessage");
        };

        window.VPL_Util.showErrorMessage = function () {
          console.log("[VPL Bypass] Blocked VPL_Util.showErrorMessage");
        };
      }
    } catch (e) {
      console.log("[VPL Bypass] Error blocking VPL_Util:", e);
    }
  }

  // ============================================
  // FORCE TEXT SELECTION
  // ============================================

  function enableTextSelection() {
    try {
      const style = document.createElement("style");
      style.textContent = `
                * {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
            `;

      if (document.head) {
        document.head.appendChild(style);
      } else if (document.documentElement) {
        document.documentElement.appendChild(style);
      }
    } catch (e) {
      console.log("[VPL Bypass] Error enabling text selection:", e);
    }
  }

  // ============================================
  // MUTATION OBSERVER - Watch for new dialogs
  // ============================================

  function startWatching() {
    try {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              const text = (node.textContent || "").toLowerCase();

              if (
                text.includes("action restricted") ||
                text.includes("not allowed") ||
                (text.includes("action") && text.includes("editor"))
              ) {
                console.log(
                  "[VPL Bypass] Instantly destroyed:",
                  text.substring(0, 50)
                );
                node.remove();
              }
            }
          });
        });
      });

      if (document.documentElement) {
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      }
    } catch (e) {
      console.log("[VPL Bypass] Error starting observer:", e);
    }
  }

  // ============================================
  // MAIN EXECUTION
  // ============================================

  function runAllFixes() {
    clearAllHandlers();
    destroyRestrictionDialogs();
    blockJQueryDialogs();
    blockVPLUtil();
    enableTextSelection();

    console.log("[VPL Bypass] All fixes applied");
  }

  // Run immediately
  runAllFixes();

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAllFixes);
  }

  // Run after page load
  window.addEventListener("load", runAllFixes);

  // Start watching for new dialogs
  startWatching();

  // Run fixes every 1 second to catch anything that gets through
  setInterval(runAllFixes, 1000);

  // Run additional fixes at specific intervals
  setTimeout(runAllFixes, 500);
  setTimeout(runAllFixes, 2000);
  setTimeout(runAllFixes, 5000);

  console.log("[VPL Bypass] Windows-compatible version loaded successfully!");
})();
