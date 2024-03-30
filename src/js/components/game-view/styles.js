import { css } from 'lit'
import { landscapeMediaQuery } from '../../styles.js'

const TOOLBAR_ICON_SIZE = css`calc(48px + var(--toolbar-padding))`
const PANEL_SIZE_PX = css`128px`
const PANEL_SIZE = css`minmax(${PANEL_SIZE_PX}, 1fr)`
const WHEEL_SIZE_PORTRAIT = css`min(800px, calc(85dvh - 200px), 85vw, 85dvw)`
const WHEEL_SIZE_LANDSCAPE = css`min(800px, calc(85dvw - 248px), 85vh, 85dvh)`

const styles = css`
  :host {
    width: 100%;
    height: 100%;
    touch-action: manipulation;
  }

  .contents {
    display: grid;
    flex: 1;
    width: 100%;
    height: 100%;

    grid-template-rows: 0 1fr ${WHEEL_SIZE_PORTRAIT} ${PANEL_SIZE} 0;
    grid-template-columns: 1fr ${WHEEL_SIZE_PORTRAIT} 1fr;

    grid-template-areas:
      '. . .'
      '. status .'
      '. wheel .'
      '. controls .'
      '. . .';
    place-items: center;
  }

  .status {
    grid-area: status;
    width: 100%;
  }

  .wheel {
    grid-area: wheel;
    width: 100%;
    aspect-ratio: 1;
    display: grid;

    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }

  .wheel tone-wheel {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  .wheel .scale-toggle-icon {
    grid-column: -2;
    grid-row: -2;
    z-index: 3;
    font-size: min(48px, calc((${WHEEL_SIZE_PORTRAIT}) * 0.1));

    position: relative;
    bottom: calc(-1 * min(24px, calc((${WHEEL_SIZE_PORTRAIT}) * 0.05)));
    right: calc(-1 * min(24px, calc((${WHEEL_SIZE_PORTRAIT}) * 0.05)));
  }

  .controls {
    grid-area: controls;
    width: 100%;
  }

  .scale-controls {
    grid-area: controls;
    width: 100%;
    height: 100%;
  }

  ${landscapeMediaQuery} {
    .contents {
      display: grid;
      flex: 1;
      column-gap: 10px;
      row-gap: 0px;

      grid-template-rows: 1fr;
      grid-template-columns: 
        /* .        */
        calc(${TOOLBAR_ICON_SIZE} - env(safe-area-inset-left))
        /* status   */ ${PANEL_SIZE}
        /* wheel    */ ${WHEEL_SIZE_LANDSCAPE}
        /* controls */ ${PANEL_SIZE}
        /* .        */ calc(${TOOLBAR_ICON_SIZE} - env(safe-area-inset-right));

      grid-template-areas: '. status wheel controls . ';
    }
    .status {
      height: ${WHEEL_SIZE_LANDSCAPE};
    }
    .controls {
      height: ${WHEEL_SIZE_LANDSCAPE};
      max-width: ${PANEL_SIZE_PX};
    }
    .scale-controls {
      height: ${WHEEL_SIZE_LANDSCAPE};
      max-width: ${PANEL_SIZE_PX};
    }

    .wheel .scale-toggle-icon {
      font-size: min(48px, calc((${WHEEL_SIZE_LANDSCAPE}) * 0.1));
      bottom: calc(-1 * min(24px, calc((${WHEEL_SIZE_LANDSCAPE}) * 0.05)));
      right: calc(-1 * min(24px, calc((${WHEEL_SIZE_LANDSCAPE}) * 0.05)));
    }
  }
`

export default styles
