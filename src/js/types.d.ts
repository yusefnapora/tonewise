import { ToneWheel } from "./app.js";
import { PitchClassElement } from "./components/tone-wheel/pitch-class.js";


declare global { 
  interface HTMLElementTagNameMap { 
  'tone-wheel': ToneWheel;
  'pitch-class': PitchClassElement;
  } 
}