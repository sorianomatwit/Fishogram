import { Graphics, Point, Sprite } from "pixi.js";
import { Global, Layers } from "./main";
import spriteAsset from './assets/fishi.png';
import waveAsset from './assets/wave.png';
import pipeAsset from './assets/pipe.png';

export abstract class Fish {
    private static fishSprite: Sprite = Sprite.from(spriteAsset);
    public static position: Point = new Point(0, 0);

    public static hspd = 0.08;
    public static init() {
        Global.gameStage.addChild(Fish.fishSprite);
        Fish.position.y = Global.currentwaveHeight;
        Fish.fishSprite.position = Fish.position;
    }

    public static moveStep() {
        //update sprite
        let sway = Math.sin(Fish.position.x * .05) * 5;
        Fish.fishSprite.scale.x = Math.sign(-Fish.hspd);
        //move
        if (Fish.fishSprite.position.x > Global.screenData.width || Fish.fishSprite.position.x < 0) {
            Fish.hspd = -Fish.hspd;
            Fish.position.x = (Math.sign(-Fish.hspd) > 0) ? Global.screenData.width - Fish.fishSprite.width : Fish.fishSprite.width;
        }
        Fish.position.x += Fish.hspd * Global.fixedDeltaTime;
        if (Fish.position.y > Global.currentwaveHeight && Fish.position.y > 0) {
            Fish.position.y -= Global.difficulty.fillRate * Global.fixedDeltaTime;
        } else Fish.position.y = Global.currentwaveHeight;
        Fish.fishSprite.position = Fish.position.add(new Point(0, sway));
    }
}

export abstract class Wave {
    private static waveSprite: Sprite[] = [];
    private static spriteSize = 64;
    private static position: Point = new Point(0, 0);
    private static tileAmt: number;
    private static fill: Graphics;
    public static isMoving: boolean = false;
    public static init() {
        console.log("hello");

        Wave.tileAmt = Global.screenData.width / Wave.spriteSize;
        for (let i = 0; i < Wave.tileAmt; i++) {
            Wave.waveSprite[i] = Sprite.from(waveAsset);
            Wave.waveSprite[i].zIndex = Layers.background;
            Global.gameStage.addChild(Wave.waveSprite[i]);
            Wave.waveSprite[i].position = Wave.position;
        }
        Wave.fill = new Graphics()
            .beginFill(0x0b7caa)
            .drawRect(this.position.x, this.position.y, Global.screenData.width, Global.screenData.height)
            .endFill();
        Global.gameStage.addChild(Wave.fill);
        Wave.fill.zIndex = Layers.background;
        Wave.position.y = Global.currentwaveHeight;
        Wave.updatePosition();
    }
    public static moveStep() {
        let amp = 4;
        let sway = Math.cos(Global.fixedGameTick * .001) * amp;
        //move
        Wave.isMoving = Wave.position.y > Global.currentwaveHeight + amp && Wave.position.y > 0;
        if (Wave.isMoving ) {
           // console.log("move");
            Wave.position.y -= Global.difficulty.fillRate * Global.fixedDeltaTime;

        } else Wave.position.y = Global.currentwaveHeight;
        if ((Global.currentPercentHeight >= Global.totalWavePercent || Global.currentwaveHeight == 0) && !Global.isInGame  ) Wave.position.y = Global.currentwaveHeight + sway;
        
        
        Wave.updatePosition();
        Wave.fill.position = this.position.add(new Point(0, Wave.spriteSize));
    }

    private static updatePosition() {
        for (let i = 0; i < Wave.tileAmt; i++) {
            Wave.waveSprite[i].position = Wave.position.add(new Point(i * Wave.spriteSize, 0));
        }
    }
}

export abstract class Pipe {
    private static pipeSprite: Sprite = Sprite.from(pipeAsset);
    public static isEnd = false;
    public static init(){
        Pipe.pipeSprite.position.x = Global.screenData.width - 64;
        Global.gameStage.addChild(Pipe.pipeSprite);
    }
    public static checkWin(): boolean{
        return (Pipe.pipeSprite.containsPoint(Fish.position))
    }
}

export abstract class Scene {
    
}