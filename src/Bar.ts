import { Graphics, Point } from "pixi.js"
import { Global } from "./main";
import { Board } from "./Board";
import { Wall } from "./GameSimulation";
import { Anagram } from "./Anagram";

export abstract class Bar {
    private static bar: { backBox: Graphics, frontBox: Graphics } = { backBox: new Graphics(), frontBox: new Graphics() };
    private static heightPercent = .05;
    private static widthPercent = 0.85;
    private static currentCount: number = 30;
    private static fullCount: number = 30;
    private static colors: { primary: number, secondary: number } = { primary: 0xA020F0, secondary: 0x501078 };
    private static dimension: { wid: number, len: number };
    public static init() {
        this.dimension = {
            wid: Global.screenData.width * this.widthPercent,
            len: Global.screenData.height * this.heightPercent
        }
        this.bar.backBox
            .beginFill(this.colors.secondary)
            .drawRoundedRect(0, 0, this.dimension.wid, this.dimension.len, 45)
            .endFill();
        let boardPoint = Board.getPoint();
        this.bar.frontBox
            .beginFill(this.colors.primary)
            .drawRoundedRect(0, 0, this.dimension.wid, this.dimension.len, 45)
            .endFill();
        this.bar.backBox.position = new Point(Global.screenData.width / 2 - this.dimension.wid / 2, boardPoint.y - this.dimension.len * 1.5);
        this.bar.frontBox.position = this.bar.backBox.position;
        Global.gameStage.addChild(this.bar.backBox, this.bar.frontBox);
        //this.addToFill();
    }

    public static addToFill(amt: number = 0) {
        // if(this.currentCount + amt >= this.fullCount){
        //     let temp = (this.currentCount + amt) - this.fullCount;
        //     this.currentCount = temp;
        //     //Wall.reset();
        //     Anagram.generateLetters();
        // } else this.currentCount += amt;
        if(this.currentCount + amt < this.fullCount) this.currentCount += amt;
        this.tween();
    }
    public static timerDecrement(){
        if(Global.frame % Global.FPS == 0  && this.currentCount > 0){
            this.currentCount--;
        }
        if(this.currentCount <= 0){
            Anagram.generateLetters();
            this.currentCount = 30;
        }
        this.tween();
    }
    public static tween(){
        this.bar.frontBox.width = (this.currentCount / this.fullCount) * this.dimension.wid;
    }

}