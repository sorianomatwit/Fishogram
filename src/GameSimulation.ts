import { Graphics, Point, Sprite } from "pixi.js";
import { Global, Layers } from "./main";
import spriteAsset from './assets/fishi.png';
import waveTile from './assets/wave.png';

export abstract class Fish {
    private static fishSprite: Sprite = Sprite.from(spriteAsset);
    private static position: Point = new Point(0,0);
    
    private static hspd = 0.1;
    public static init(){
        Global.gameStage.addChild(Fish.fishSprite);
        Fish.fishSprite.position = Fish.position;
    }

    public static moveStep(){
        //update sprite
        Fish.fishSprite.scale.x = Math.sign(-Fish.hspd);
        //move
        if(Fish.fishSprite.position.x > Global.screenData.width || Fish.fishSprite.position.x < 0){
            Fish.hspd = -Fish.hspd;
            Fish.position.x = (Math.sign(-Fish.hspd) > 0) ? Global.screenData.width - Fish.fishSprite.width : Fish.fishSprite.width ; 
        }
        Fish.position.x += Fish.hspd;
        Fish.position.y = Global.currentwaveHeight + Math.sin(Fish.position.x *.08) * 5;
        Fish.fishSprite.position = Fish.position;
    }
}

export abstract class Wave {
    private static waveSprite: Sprite[] = [];
    private static spriteSize = 64;
    private static position: Point = new Point(0,0);
    private static tileAmt : number;
    private static fill: Graphics;

    public static init(){
        this.tileAmt = Global.screenData.width/Wave.spriteSize;
        for (let i = 0; i < Wave.tileAmt; i++) {
            Wave.waveSprite[i] = Sprite.from(waveTile);
            Wave.waveSprite[i].zIndex = Layers.background;
            Global.gameStage.addChild(Wave.waveSprite[i]);
            Wave.waveSprite[i].position = Wave.position;
        }
        this.fill = new Graphics()
            .beginFill(0x0b7caa)
            .drawRect(this.position.x,this.position.y,Global.screenData.width,Global.screenData.height)
            .endFill();
            Global.gameStage.addChild(Wave.fill);
        this.fill.zIndex = Layers.background;
        Wave.updatePosition();
    }
    public static moveStep(){
        //move
        Wave.position.y = Global.currentwaveHeight + Math.cos(Global.fixedFrame * .02) * 4;
        Wave.updatePosition();
        Wave.fill.position = this.position.add(new Point(0,Wave.spriteSize));
    }

    private static updatePosition() {
        for (let i = 0; i < Wave.tileAmt; i++) {
            Wave.waveSprite[i].position = Wave.position.add(new Point(i*Wave.spriteSize,0));
        }
    }
}