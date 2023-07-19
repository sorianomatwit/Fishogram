import { Point } from "pixi.js"
import { Board } from "./Board";
import { Anagram } from "./Anagram";
import { Bar } from "./Bar";
import { Global } from "./main";
export abstract class TouchManager {
    public static happened: boolean = false;
    public static allTouches: Point[] = [];
    public static collectInput() {
        document.body.ontouchstart = TouchManager.onTouch;
        document.body.ontouchmove = TouchManager.moveTouch;
        document.body.ontouchend = TouchManager.releaseTouch;
        document.addEventListener("keydown", (e) => {
            if(e.key == " " && !this.happened){
                Anagram.generateLetters();
                this.happened = true;
                
            }
        })
        document.addEventListener("keyup", (e) => {
            if(e.key == " " && this.happened){
                this.happened = false;
                
            }
        })
        
    }

    public static onTouch(touch: TouchEvent) {
        let touchPosition: Point = new Point(touch.touches[touch.touches.length - 1].clientX, touch.touches[touch.touches.length - 1].clientY);
        Board.selectBox(Board.findBox(touchPosition));
    }

    public static moveTouch(touch: TouchEvent) {
        let touchPosition: Point = new Point(touch.touches[touch.touches.length - 1].clientX, touch.touches[touch.touches.length - 1].clientY);
        if(!Board.mainBoard.containsPoint(touchPosition)) Board.resetAllBox();
        Board.selectBox(Board.findBox(touchPosition));

    }

    public static releaseTouch() {
        if(Anagram.isValidWord()){
            Bar.addToFill(Global.recordedWord.length);
            if(Global.recordedWord.length > 0)Anagram.addWord();
        }
        Anagram.clear();
        Board.resetAllBox();

    }
}