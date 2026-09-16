/**
 * Used for the automatic browser full screen setting
 * and for hiding the scrollbar in full screen.
 */
export default async function ({ addon, console }) {
  const vm = addon.tab.traps.vm;

  const updateStageSize = () => {
    document.documentElement.style.setProperty(
      "--sa-fullscreen-width",
      vm.runtime.stageWidth
    );
    document.documentElement.style.setProperty(
      "--sa-fullscreen-height",
      vm.runtime.stageHeight
    );
  };

  updateStageSize();
  vm.on("STAGE_SIZE_CHANGED", updateStageSize);

  // In Electron, after running requestFullscreen() a resize event can be fired before
  // document.fullscreenElement is updated. We want to ignore that event.
  let isEnteringFullscreen = false;

  // URL that existed immediately BEFORE Scratch changed the URL to /fullscreen.
  // This only stores the pathname, so it never contains ?parameters or #hash.
  let fullscreenOrigin = null;

  /*
   * Scratch changes the URL to /fullscreen itself.
   *
   * There is no browser API such as history.previousURL, so intercept
   * pushState() and replaceState() before Scratch gets to them.
   *
   * This lets us see the old URL while window.location still contains
   * the URL from before fullscreen.
   */
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  function getNavigationURL(url) {
    if (url == null) return null;

    try {
      return new URL(url, window.location.href);
    } catch {
      return null;
    }
  }

  function interceptHistoryChange(original, state, title, url) {
    const nextURL = getNavigationURL(url);

    // Scratch's fullscreen URL is /fullscreen.
    if (
      nextURL &&
      nextURL.pathname === "/fullscreen" &&
      window.location.pathname !== "/fullscreen"
    ) {
      // IMPORTANT:
      // window.location is still the URL from BEFORE Scratch changes it.
      //
      // Only save the pathname. Search parameters and hash are intentionally
      // not saved here because they will be taken from the fullscreen URL
      // when fullscreen is exited.
      fullscreenOrigin = window.location.pathname;
    }

    return original.call(window.history, state, title, url);
  }

  window.history.pushState = function (state, title, url) {
    return interceptHistoryChange(
      originalPushState,
      state,
      title,
      url
    );
  };

  window.history.replaceState = function (state, title, url) {
    return interceptHistoryChange(
      originalReplaceState,
      state,
      title,
      url
    );
  };

  // When leaving fullscreen, return to the pathname from before fullscreen.
  // The current fullscreen URL's query parameters and hash are kept.
  function exitFullscreenPage() {
    if (window.location.pathname !== "/fullscreen") return;
    if (!fullscreenOrigin) return;

    const search = window.location.search;
    const hash = window.location.hash;

    window.history.replaceState(
      null,
      "",
      fullscreenOrigin + search + hash
    );

    fullscreenOrigin = null;
  }

  // "Browser fullscreen" is defined as the mode that hides the browser UI.
  function updateBrowserFullscreen() {
    if (addon.settings.get("browserFullscreen") && !addon.self.disabled) {
      // If Scratch fullscreen is enabled, then browser fullscreen should also
      // be enabled, and vice versa for disabling.
      if (
        addon.tab.redux.state.scratchGui.mode.isFullScreen &&
        document.fullscreenElement === null
      ) {
        isEnteringFullscreen = true;

        document.documentElement
          .requestFullscreen()
          .then(() => {
            isEnteringFullscreen = false;
          })
          .catch((err) => {
            console.error(err);
            isEnteringFullscreen = false;
          });
      } else if (
        !addon.tab.redux.state.scratchGui.mode.isFullScreen &&
        document.fullscreenElement !== null
      ) {
        document.exitFullscreen();
      }
    }
  }

  // "Scratch fullscreen" is defined as the mode normally toggled by the
  // rightmost button above the stage.
  function updateScratchFullscreen() {
    if (addon.settings.get("browserFullscreen") && !addon.self.disabled) {
      // If browser fullscreen is disabled, then Scratch fullscreen should also
      // be disabled.
      if (
        document.fullscreenElement === null &&
        addon.tab.redux.state.scratchGui.mode.isFullScreen
      ) {
        addon.tab.redux.dispatch({
          type: "scratch-gui/mode/SET_FULL_SCREEN",
          isFullScreen: false,
        });
      }
    }
  }

  // The "phantom header" is a small strip at the top of the page that
  // brings the header into view when hovered.
  async function updatePhantomHeader() {
    if (
      !addon.self.disabled &&
      addon.tab.redux.state.scratchGui.mode.isFullScreen &&
      addon.settings.get("toolbar") === "hover"
    ) {
      const canvas = await addon.tab.waitForElement(
        '[class*="stage_full-screen"] canvas'
      );

      const header = await addon.tab.waitForElement(
        '[class^="stage-header_stage-header-wrapper"]'
      );

      const phantom = header.parentElement.appendChild(
        document.createElement("div")
      );

      phantom.classList.add("phantom-header");

      // Make the header a child of the phantom, so that mouseleave will trigger
      // when the mouse leaves the header OR the phantom header.
      phantom.appendChild(header);

      phantom.addEventListener("mouseenter", () => {
        header.classList.add("stage-header-hover");
      });

      phantom.addEventListener("mouseleave", () => {
        header.classList.remove("stage-header-hover");
      });

      // Listen for when the mouse moves above the page
      // (helps to show header when not in browser full screen mode)
      document.body.addEventListener("mouseleave", (e) => {
        if (e.clientY < 8) {
          header.classList.add("stage-header-hover");
        }
      });

      // And when the mouse re-enters the page.
      document.body.addEventListener("mouseenter", () => {
        header.classList.remove("stage-header-hover");
      });

      // Pass click events on the phantom header onto the project player,
      // essentially making it click-through.
      [
        "mousedown",
        "mousemove",
        "mouseup",
        "touchstart",
        "touchmove",
        "touchend",
        "wheel",
      ].forEach((eventName) => {
        phantom.addEventListener(eventName, (e) => {
          if (e.target.classList.contains("phantom-header")) {
            canvas.dispatchEvent(new e.constructor(e.type, e));
          }
        });
      });
    } else {
      const header = await addon.tab.waitForElement(
        '[class^="stage-header_stage-header-wrapper"]'
      );

      if (header.parentElement.classList.contains("phantom-header")) {
        const phantom = header.parentElement;

        phantom.parentElement.appendChild(header);
        phantom.remove();
      }
    }
  }

  updatePhantomHeader();

  async function setPageScrollbar() {
    const body = await addon.tab.waitForElement(".sa-body-editor");

    if (addon.tab.redux.state.scratchGui.mode.isFullScreen) {
      body.classList.add("sa-fullscreen");
    } else {
      body.classList.remove("sa-fullscreen");
    }
  }

  // Properly resize the canvas and scale variable monitors on stage resize.
  let monitorScaler, resizeObserver, stage;

  async function initScaler() {
    monitorScaler = await addon.tab.waitForElement(
      "[class*=monitor-list_monitor-list-scaler]"
    );

    stage = await addon.tab.waitForElement(
      '[class*="stage-wrapper_full-screen"] [class*="stage_stage"] canvas'
    );

    resizeObserver = new ResizeObserver(() => {
      const stageSize = stage.getBoundingClientRect();

      // When switching between project page and editor, the canvas
      // is removed from the DOM and inserted again in a different place.
      // This causes the size to be reported as 0x0.
      if (!stageSize.width || !stageSize.height) return;

      // Width and height attributes of the canvas need to match the actual size.
      const renderer = addon.tab.traps.vm.runtime.renderer;

      if (renderer) {
        renderer.resize(stageSize.width, stageSize.height);
      }

      // Scratch uses the transform CSS property on a stage overlay element
      // to control the scaling of variable monitors.
      const scale = stageSize.width / vm.runtime.stageWidth;

      monitorScaler.style.transform = `scale(${scale}, ${scale})`;
    });

    resizeObserver.observe(stage);
  }

  initScaler();

  // Running this on page load handles the case of the project initially
  // loading in Scratch fullscreen mode.
  setPageScrollbar();
  updateBrowserFullscreen();

  // Changing to or from Scratch fullscreen is signified by a state change
  // (URL change doesn't work when editing project without project page)
  addon.tab.redux.initialize();

  addon.tab.redux.addEventListener("statechanged", (e) => {
    if (
      e.detail.action.type ===
      "scratch-gui/mode/SET_FULL_SCREEN"
    ) {
      initScaler();
      updateBrowserFullscreen();
      setPageScrollbar();
      updatePhantomHeader();

      // Scratch has now exited fullscreen.
      //
      // At this point Scratch may already have changed the URL back from
      // /fullscreen, so the history interception above is what captures
      // the original URL when ENTERING fullscreen.
      if (!e.detail.action.isFullScreen) {
        exitFullscreenPage();
      }
    }
  });

  // Changing to or from browser fullscreen is signified by a window resize.
  window.addEventListener("resize", () => {
    if (!isEnteringFullscreen) {
      updateScratchFullscreen();
    }
  });

  // Handles the case of F11 fullscreen AND document fullscreen being enabled
  // at the same time.
  document.addEventListener("fullscreenchange", () => {
    if (
      document.fullscreenElement === null &&
      addon.tab.redux.state.scratchGui.mode.isFullScreen
    ) {
      addon.tab.redux.dispatch({
        type: "scratch-gui/mode/SET_FULL_SCREEN",
        isFullScreen: false,
      });
    }

    // Browser fullscreen was exited.
    if (document.fullscreenElement === null) {
      exitFullscreenPage();
    }
  });

  // These handle the case of the user already being in Scratch fullscreen
  // (without being in browser fullscreen) when the addon or sync option
  // is dynamically enabled.
  addon.settings.addEventListener("change", () => {
    updateBrowserFullscreen();
    updatePhantomHeader();
  });

  addon.self.addEventListener("disabled", () => {
    resizeObserver.disconnect();
    updatePhantomHeader();
  });

  addon.self.addEventListener("reenabled", () => {
    resizeObserver.observe(stage);
    updateBrowserFullscreen();
    updatePhantomHeader();
  });
}
