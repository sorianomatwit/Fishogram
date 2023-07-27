import { Point } from "pixi.js"
import { Bar, Board } from "./Board";
import { Anagram } from "./Anagram";
import { Global } from "./main";
export abstract class TouchManager {
    public static happened: boolean = false;
    public static lastTouch: Point;
    public static collectInput() {
        document.body.ontouchstart = TouchManager.moveTouch;
        document.body.ontouchmove = TouchManager.moveTouch;
        document.body.ontouchend = TouchManager.releaseTouch;
        document.addEventListener("keydown", (e) => {
            if (e.key == " " && !this.happened) {
                Global.resetBoard();
                this.happened = true;

            }
        })
        document.addEventListener("keyup", (e) => {
            if (e.key == " " && this.happened) {
                this.happened = false;

            }
        })

    }

    public static onTouch(touch: TouchEvent) {
        let touchPosition: Point = new Point(touch.touches[touch.touches.length - 1].clientX, touch.touches[touch.touches.length - 1].clientY);
        this.lastTouch = touchPosition;
        Board.selectBox(Board.findBox(touchPosition));
    }

    public static moveTouch(touch: TouchEvent) {
        let touchPosition: Point = new Point(touch.touches[touch.touches.length - 1].clientX, touch.touches[touch.touches.length - 1].clientY);
        this.lastTouch = touchPosition;
        if (!Board.mainBoard.containsPoint(touchPosition)) {
            if (Anagram.isValidWord()) {
                Anagram.addWord();
                Global.isInGame = true;
            }
            Board.resetAllBox();
            Global.recordedWord = "";
        } else
            Board.selectBox(Board.findBox(touchPosition));

    }

    public static releaseTouch() {
        if (Global.currentStage == Global.gameStage) {
            if (Bar.isTriggered(this.lastTouch)) {
                Global.resetBoard();
            }
            if (Anagram.isValidWord()) {
                Anagram.addWord();
                Global.isInGame = true;
            }
            Global.recordedWord = "";
            Board.resetAllBox();
        } else {
            console.log("press");
            
            Global.resetGame();
        }
    }
}