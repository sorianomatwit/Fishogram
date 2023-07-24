import { Container, Renderer, TextStyle, Text, Point } from "pixi.js";
import { Board } from "./Board";
import { TouchManager } from "./TouchManager";
import { Anagram } from "./Anagram";
import { Fish, Wave } from "./GameSimulation";
///Global variable
export enum Layers {
  water = 0,
  background = 1,
  hitboxes = 2,
  hitboxTwo = 3,
  text = 4,
  line = 5
}
export abstract class Global {
  static screenData = {
    width: window.innerWidth,
    height: window.innerHeight,
    screenRatio: window.innerWidth / window.innerHeight
  }
  /// Frame Controling Variables
  static readonly FPS: number = 60;
  static readonly fixedIncrement: number = 1000 / Global.FPS;
  static readonly MAXFRAMESKIP = 10;
  static rendererDeltaTime : number = 0;
  static fixedGameTick : number = 0;
  static oldTime : number = Date.now();
  static fixedFrame : number = 0;
  static frame : number = 0;
  static startTime : number = Date.now();
  static currentPercentHeight = .5;
  static totalwaveHeight = this.screenData.height * Global.currentPercentHeight;
  static currentwaveHeight = this.screenData.height * Global.currentPercentHeight;
  //application setup
  static readonly renderer: Renderer = new Renderer(
    {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x5A5A5A
  }
  )
  static readonly gameStage = new Container();
  static readonly universalTextStyle = new TextStyle({
    dropShadow: true,
    dropShadowAngle: 0,
    dropShadowDistance: 2,
    fill: "#eb790f",
    fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
    strokeThickness: 1

  })

  //Game vars
  public static anagramLetters: string[] = [];
  public static recordedWord: string = "";
  public static usedWords: String[] = [];
  //Utils
  public static removeElement<T>(array: T[], element: T) {
    let index = array.indexOf(element);
    if (index != -1) {
      array.splice(index, 1);
    }
  }
}

//@ts-expect-error 
document.body.appendChild(Global.renderer.view);
document.documentElement.style.overflow = 'hidden';
let scrollTop = window.scrollY || document.documentElement.scrollTop;
let scrollLeft = window.scrollX || document.documentElement.scrollLeft;
window.onscroll = () => window.scrollTo(scrollLeft, scrollTop);
Global.gameStage.sortDirty = true;
//Game setup
Fish.init();
Wave.init();
Anagram.init();
Board.init();

Global.gameStage.sortChildren();
function simulate() {
  Fish.moveStep();
  Wave.moveStep();
}

let currentSec = 1;
function gameloop() {
  TouchManager.collectInput();
  let newTime = Date.now();
  Global.rendererDeltaTime = newTime - Global.oldTime;
  Global.oldTime = newTime;
  Global.frame++;

  let loops = 0;
  if (Math.floor((Date.now() - Global.startTime) /1000) == currentSec) {

    Global.fixedFrame++;
    currentSec++;
  }
  //fixed update
  while (Date.now() > Global.fixedGameTick && loops < Global.MAXFRAMESKIP) {

    
    Global.fixedFrame++;
    simulate();
    Global.fixedGameTick += Global.fixedIncrement;
    loops++;
  }
  
  Global.renderer.render(Global.gameStage);
  requestAnimationFrame(gameloop);
}
TouchManager.collectInput();
gameloop();




