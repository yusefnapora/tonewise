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
    /* display: grid;
    place-items: center;  */
  }

  .contents {
    display: grid;
    flex: 1;
    width: 100%;
    height: 100%;

    /* column-gap: 10px; */
    row-gap: 10px;

    grid-template-rows: 0 1fr ${WHEEL_SIZE_PORTRAIT} min-content ${PANEL_SIZE} 0;
    grid-template-columns: 1fr ${WHEEL_SIZE_PORTRAIT} 1fr;

    grid-template-areas:
      '. . .'
      '. status .'
      '. wheel .'
      '. scale .'
      '. controls .'
      '. . .';
    place-items: center;
  }


  .status {
    grid-area: status;
    width: 100%;
  }

  .scale {
    grid-area: scale;
    /* z-index: 10; */
    width: 100%;
    height: 0;
    position: relative;
  }

  .scale .toggle-icon {
    font-size: min(48px, calc((${WHEEL_SIZE_PORTRAIT}) * 0.1));
    width: min(64px, calc((${WHEEL_SIZE_PORTRAIT}) * 0.2));
    aspect-ratio: 1;
    position: absolute;
    top: max(-64px, calc((${WHEEL_SIZE_PORTRAIT}) * -0.2));
    right: max(-16px, calc((${WHEEL_SIZE_PORTRAIT}) * -0.2 / 4));
    z-index: 5;
  }

  /* .scale scale-badge {

  } */

  .wheel {
    grid-area: wheel;
    width: 100%;
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
        ${TOOLBAR_ICON_SIZE}
        /* status   */ ${PANEL_SIZE}
        /* wheel    */ ${WHEEL_SIZE_LANDSCAPE}
        /* scale    */ min-content
        /* controls */ ${PANEL_SIZE}
        /* .        */ max(${TOOLBAR_ICON_SIZE}, 0px);

      /* note: useless max() above is to trick the vscode lit plugin's invalid syntax checker,
        which breaks if the last element before a ';' char is a template string interpolation */
      grid-template-areas: '. status wheel scale controls . ';
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
    .scale {
      height: 100%;
    }
    .scale .toggle-icon {
      font-size: min(48px, calc((${WHEEL_SIZE_LANDSCAPE}) * 0.1));
      width: min(64px, calc((${WHEEL_SIZE_LANDSCAPE}) * 0.2));
      top: auto;
      bottom: min(64px, calc((${WHEEL_SIZE_PORTRAIT}) * 0.2));
      right: min(-16px, calc((${WHEEL_SIZE_PORTRAIT}) * -0.1));
    }
  }
`

export default styles
