import { css } from 'lit'
import { landscapeMediaQuery } from '../../styles.js'

const TOOLBAR_ICON_SIZE = css`calc(48px + var(--toolbar-padding))`
const PANEL_SIZE_PX = css`128px`
const PANEL_SIZE = css`minmax(${PANEL_SIZE_PX}, 1fr)`
const WHEEL_SIZE_PORTRAIT = css`min(800px, calc(85dvh - 200px), 85dvw)`
const WHEEL_SIZE_LANDSCAPE = css`min(800px, calc(85dvw - 248px), 85dvh)`

const styles = css`
  :host {
    width: 100%;
    height: 100%;
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

    grid-template-rows: 0 1fr ${WHEEL_SIZE_PORTRAIT} ${PANEL_SIZE} 0;
    grid-template-columns: 1fr ${WHEEL_SIZE_PORTRAIT} 1fr;

    grid-template-areas:
      '. . .'
      '. status .'
      '. wheel .'
      '. progress .'
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
  }

  .progress {
    grid-area: progress;
    width: 100%;
    /* height: 100%; */
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
        /* progress */ ${PANEL_SIZE}
        /* .        */ max(${TOOLBAR_ICON_SIZE}, 0px);

      /* note: useless max() above is to trick the vscode lit plugin's invalid syntax checker,
        which breaks if the last element before a ';' char is a template string interpolation */
      grid-template-areas: '. status wheel progress . ';
    }
    .status {
      height: ${WHEEL_SIZE_LANDSCAPE};
    }
    .progress {
      height: ${WHEEL_SIZE_LANDSCAPE};
      max-width: ${PANEL_SIZE_PX};
    }
  }
`

export default styles
