import { Container, Renderer, TextStyle, Text, Point, Graphics } from "pixi.js";
import { Board, Bar } from "./Board";
import { TouchManager } from "./TouchManager";
import { Anagram } from "./Anagram";
import { Fish, Pipe, Wave } from "./GameSimulation";
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
  static rendererDeltaTime: number = 0;
  static fixedGameTick: number = 0;
  static fixedDeltaTime: number = 0;
  static oldTime: number = Date.now();
  static oldFixedTime: number = 0;
  static fixedFrame: number = 0;
  static frame: number = 0;
  static startTime: number = Date.now();
  static currentPercentHeight = .5;
  static totalWavePercent = Global.currentPercentHeight;
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
  static readonly endStage = new Container();
  static currentStage: Container = this.gameStage;
  static readonly universalTextStyle = new TextStyle({
    align: "center",
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
  public static isCombo: boolean = false;
  public static isDraining: boolean = false;
  public static isInGame: boolean = false; // if the user has input a word for the first time
  public static difficulty = {
    drainRate: .00003,
    fillRate: 0.15
  }
  //Utils
  public static removeElement<T>(array: T[], element: T) {
    let index = array.indexOf(element);
    if (index != -1) {
      array.splice(index, 1);
    }
  }
  public static resetBoard() {
    Anagram.generateLetters();
    Board.updatetext();
  }
  public static resetGame() {
    Global.currentStage = Global.gameStage;
    this.resetBoard();
    Global.currentwaveHeight = this.totalWavePercent * this.screenData.height;
    Global.currentPercentHeight = .5;
    Bar.update();
    Board.resetAllBox();
    Anagram.clear();

  }
}

abstract class EndScreen {
  static mainText = new Text("!!YOU LOSE!!", Global.universalTextStyle);
  static readonly background = new Graphics()
    .beginFill(0x000000, .3)
    .drawRect(0, 0, Global.screenData.width, Global.screenData.height)
    .endFill();
  static readonly instruction = new Text("Tap To Play", Global.universalTextStyle);
  static init() {
    let instruction = EndScreen.instruction;
    let mainText = EndScreen.mainText;
    let background = EndScreen.background;
    instruction.position.set(Global.screenData.width * .5 - instruction.width, Global.screenData.height * .6);
    mainText.position.set(Global.screenData.width * .5 - mainText.width, Global.screenData.height * .2);
    background.zIndex = Layers.background;
    mainText.zIndex = Layers.text;
    instruction.zIndex = Layers.text;
    Global.endStage.addChild(
      background,
      mainText,
      instruction
    )
  }
}


//@ts-expect-error 
document.body.appendChild(Global.renderer.view);
document.documentElement.style.overflow = 'hidden';
let scrollTop = window.scrollY || document.documentElement.scrollTop;
let scrollLeft = window.scrollX || document.documentElement.scrollLeft;
window.onscroll = () => window.scrollTo(scrollLeft, scrollTop);
Global.gameStage.sortDirty = true;

EndScreen.init();
//Game setup
Fish.init();
Wave.init();
Pipe.init();
Anagram.init();
Board.init();
Bar.init();


Global.gameStage.sortChildren();
function simulate() {
  Bar.update();
  Fish.moveStep();
  if (Fish.position.y > Global.currentwaveHeight - 10 && !Global.isInGame) {
    Global.difficulty.fillRate = .75;

  } else Global.difficulty.fillRate = .15;
  Wave.moveStep();
  if (Global.currentwaveHeight == 0) {
    Global.isInGame = false;
    Fish.hspd = Math.abs(Fish.hspd);
    if (Pipe.checkWin()) {
      Global.currentStage = Global.endStage;
      EndScreen.mainText.text = "!!YOU WIN!!";
      
    }
  }

  Global.isDraining = Global.isInGame && !Wave.isMoving
  if (Global.isDraining) {
    // console.log("drain");
    Global.isCombo = false;
    Global.currentPercentHeight += Global.difficulty.drainRate * Global.fixedDeltaTime;
    Global.currentwaveHeight = Global.screenData.height * Global.currentPercentHeight;
  }

  if (Global.currentwaveHeight >= Global.screenData.height && Global.isInGame) {
    Global.isInGame = false;
    Global.currentStage = Global.endStage;
    EndScreen.mainText.text = "!!YOU LOSE!!";
  }
}

let currentSec = 1;
function gameloop() {
  TouchManager.collectInput();
  let newTime = Date.now();
  Global.rendererDeltaTime = newTime - Global.oldTime;
  Global.oldTime = newTime;
  Global.frame++;

  let loops = 0;

  //fixed update
  while (Date.now() > Global.fixedGameTick && loops < Global.MAXFRAMESKIP) {
    Global.fixedDeltaTime = Date.now() - Global.oldFixedTime;
    Global.oldFixedTime = Date.now();
    Global.fixedFrame++;
    simulate();
    Global.fixedGameTick += Global.fixedIncrement;
    loops++;
  }

  Global.renderer.render(Global.currentStage);
  requestAnimationFrame(gameloop);
}
TouchManager.collectInput();
gameloop();




