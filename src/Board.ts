import { Graphics, Text, Point } from "pixi.js";
import { Global, Layers } from "./main";
import '@pixi/math-extras';
import { Anagram } from "./Anagram";
export abstract class Board {
    public static mainBoard: Graphics;
    private static grid: Graphics[] = [];
    private static hitboxes: Graphics[] = [];
    private static displayText: Text[] = [];
    private static defaultTint = 0x1C30A0;
    private static secondaryTint = 0xFA3BA1;
    private static currentSelectedBox: Point;
    private static currentSelectedIndexes: number[] = [];
    private static selectedBoxPoints: Point[] = [];
    private static activeBoxes: boolean[] = [];
    private static selectedLines: Graphics[] = [];
    private static fontSize: number = 0;
    private static screenPercentage = {
        height: .35,
        width: .80
    }
    private static rectVars = {
        width: 0,
        height: 0,
        X: 0,
        Y: 0,
        cols: 4,
        rows: 4,

    }


    public static init() {
        this.rectVars.width = Global.screenData.width * this.screenPercentage.width;
        this.rectVars.height = Global.screenData.height * this.screenPercentage.height;
        this.rectVars.X = Global.screenData.width / 2 - this.rectVars.width / 2;
        this.rectVars.Y = Global.screenData.height * (1 - this.screenPercentage.height - .015/*buffer*/);

        this.mainBoard = new Graphics()
            .beginFill(0x00FF00)
            .drawRoundedRect(this.rectVars.X, this.rectVars.Y, this.rectVars.width, this.rectVars.height, 15)
            .endFill();
        this.mainBoard.zIndex = Layers.background;
        Global.gameStage.addChild(this.mainBoard);

        Anagram.generateLetters(false);
        let wid = this.rectVars.width / 4 - 6;
        let len = this.rectVars.height / 4 - 6;
        this.fontSize = len * .75
        for (let i = 0; i < this.rectVars.cols * this.rectVars.rows; i++) {

            let x = this.rectVars.X + (wid * (i % 4)) + 6 * (i % 4) + 3;
            let y = this.rectVars.Y + (len * Math.floor(i / 4)) + 6 * Math.floor(i / 4) + 3;
            this.activeBoxes[i] = false;
            this.grid[i] = new Graphics()
                .beginFill(0xFFFFFF)
                .lineStyle(2, 0x000000)
                .drawRoundedRect(0, 0, wid, len, 15)
                .endFill();
            this.grid[i].position = new Point(x, y);
            this.grid[i].tint = 0x1C30A0;
            this.grid[i].zIndex = Layers.background;
            this.hitboxes[i] = new Graphics()
                .beginFill(0x000000, 0.001)
                .lineStyle(2, 0x000000)
                .drawRoundedRect(0, 0, wid, len, 15)
                .endFill();
            this.hitboxes[i].position = new Point(x, y);
            this.hitboxes[i].zIndex = Layers.hitboxes;
            this.displayText[i] = new Text(Global.anagramLetters[i], Global.universalTextStyle);
            this.displayText[i].zIndex = Layers.text;
            this.displayText[i].style.fontSize = this.fontSize
            this.displayText[i].position = new Point(
                x + this.grid[i].width / 2 - this.displayText[i].width / 2,
                y + this.grid[i].height / 2 - this.displayText[i].height / 2
            );
            Global.gameStage.addChild(this.grid[i], this.displayText[i], this.hitboxes[i]);
        }

    }
    public static getPoint(): Point { return new Point(this.rectVars.X, this.rectVars.Y); }

    public static updatetext() {
        for (let i = 0; i < this.grid.length; i++) {
            if (this.displayText[i] != null) Global.gameStage.removeChild(this.displayText[i]);
            let x = this.rectVars.X + ((this.rectVars.width / 4) * (i % 4));
            let y = this.rectVars.Y + ((this.rectVars.height / 4) * Math.floor(i / 4))
            this.displayText[i] = new Text(Global.anagramLetters[i], Global.universalTextStyle);
            this.displayText[i].zIndex = Layers.text;
            this.displayText[i].style.fontSize = this.fontSize

            this.displayText[i].position = new Point(
                x + this.grid[i].width / 2 - this.displayText[i].width / 2,
                y + this.grid[i].height / 2 - this.displayText[i].height / 2
            );
            Global.gameStage.addChild(this.displayText[i]);
        }
    }
    //private static 
    private static addLine(boxPosition: Point) {
        let wid = this.rectVars.width / 4;
        let len = this.rectVars.height / 4;
        let centerPoint = new Point(wid / 2, len / 2);
        if (this.selectedBoxPoints.indexOf(boxPosition) == -1) {
            this.selectedBoxPoints.push(boxPosition);
            for (let i = this.selectedBoxPoints.length - 2; i < this.selectedBoxPoints.length - 1 && this.selectedBoxPoints.length > 1; i++) {

                const curPoint = this.selectedBoxPoints[i].add(centerPoint, new Point());
                const nextPoint = this.selectedBoxPoints[i + 1]
                const newPoint = curPoint.subtract(nextPoint, new Point()).multiplyScalar(-1).add(centerPoint);
                this.selectedLines[i] = new Graphics()
                    .beginFill(0x000000)
                    .lineStyle({ width: 10, color: 0x000000 })
                    .lineTo(newPoint.x, newPoint.y)
                    .endFill();
                this.selectedLines[i].zIndex = Layers.line;
                this.selectedLines[i].position = curPoint;
                Global.gameStage.addChild(this.selectedLines[i]);
            }
        }

    }
    private static removeLine(boxPosition: Point) {
        let posIndex = this.selectedBoxPoints.indexOf(boxPosition)
        if (posIndex != -1) {
            Global.removeElement<Point>(this.selectedBoxPoints, boxPosition);
            Global.gameStage.removeChild(this.selectedLines[posIndex]);
            this.selectedLines.splice(posIndex, 1);
        }
    }
    private static getCoord(index: number): Point {
        return new Point(Math.floor(index / this.rectVars.rows), index % this.rectVars.cols)
    }
    public static selectBox(index: number) {

        if (index != -1) {
            let availableIndexes: number[] = [];
            let recentIndex = (this.currentSelectedIndexes.length <= 0)? index: this.currentSelectedIndexes[this.currentSelectedIndexes.length - 1];

            for (let i = 0; i < this.grid.length && this.currentSelectedIndexes.length > 0; i++) {
                let otherBoxPoint = this.getCoord(i);
                let mag = this.currentSelectedBox.subtract(otherBoxPoint).magnitude();
                //default hitbox

                let hitbox: Graphics = this.hitboxes[i];
                hitbox.width = this.rectVars.width / 4;
                hitbox.height = this.rectVars.height / 4;
                let x = this.rectVars.X + ((this.rectVars.width / 4) * (i % 4));
                let y = this.rectVars.Y + ((this.rectVars.height / 4) * Math.floor(i / 4))
                hitbox.position = new Point(x, y);
                hitbox.visible = false;
                hitbox.zIndex = Layers.hitboxes;
                if (Math.floor(mag) <= 1) {
                    if (!this.activeBoxes[i]) {
                        availableIndexes.push(i);
                        if (mag > 1) {
                            //corner hitbox
                            //console.log("hit");
                            
                            let diff = this.currentSelectedBox.subtract(otherBoxPoint);
                            diff = diff.subtract(new Point(1, 1))
                            diff = diff.multiplyScalar(-.5);
                            //console.log(`${Global.anagramLetters[i]} : ${diff}`);
                            hitbox.width = 20;
                            hitbox.height = 20;
                            let x = this.rectVars.X + ((this.rectVars.width / 4) * (recentIndex % 4)) + diff.y * (this.rectVars.width / 4) - hitbox.width * diff.y;
                            let y = this.rectVars.Y + ((this.rectVars.height / 4) * Math.floor(recentIndex / 4)) + diff.x * (this.rectVars.width / 4) - hitbox.height * diff.x;
                            hitbox.position = new Point(x, y);
                            hitbox.zIndex = Layers.hitboxTwo;
                        }
                    }
                }
                
                //highlights if used word
                if (this.activeBoxes[i]) {
                    
                    let hitbox: Graphics = this.hitboxes[i];
                    hitbox.width = this.rectVars.width / 4;
                    hitbox.height = this.rectVars.height / 4;
                    let x = this.rectVars.X + ((this.rectVars.width / 4) * (i % 4));
                    let y = this.rectVars.Y + ((this.rectVars.height / 4) * Math.floor(i / 4))
                    hitbox.position = new Point(x, y);
                    this.grid[i].tint = (Anagram.isValidWord()) ? 0x50C878 : this.secondaryTint;
                    //console.log(`${Global.recordedWord} : ${Anagram.isValidWord()}`);
                    if (Global.usedWords.indexOf(Global.recordedWord.toLowerCase()) != -1) {
                        this.grid[i].tint = 0xFF0000;
                    }
                }
                
            }

            if (this.currentSelectedIndexes.indexOf(index) == -1 && index >= 0 && (availableIndexes.indexOf(index) != -1 || this.currentSelectedIndexes.length <= 0)) {
                this.currentSelectedIndexes.push(index) //* this.rectVars.rows
                recentIndex = this.currentSelectedIndexes[this.currentSelectedIndexes.length - 1];
                this.activeBoxes[recentIndex] = true;
                Anagram.recordChar(Global.anagramLetters[recentIndex]);
                this.currentSelectedBox = this.getCoord(index);
            }
            
            //highlights box if it is a valid word
            //console.log(this.currentSelectedIndexes);
            
            if (recentIndex>= 0 ) {
                let Box: Graphics = this.grid[recentIndex];
                if (this.selectedBoxPoints.indexOf(Box.position) == -1) this.currentSelectedBox = this.getCoord(recentIndex);
                this.addLine(Box.position);
                Box.zIndex = Layers.hitboxes;
                Box.updateTransform();
            }


        }
    }
    public static unselectBox(index: number) {
        this.currentSelectedIndexes = [];
        if (index >= 0 && this.selectedBoxPoints.length > 0) {
            let Box: Graphics = this.grid[index];
            this.activeBoxes[index] = false;
            //console.log("hel");
            this.removeLine(Box.position)
            Box.zIndex = Layers.hitboxes;
            Global.gameStage.sortChildren();
        }
    }
    public static resetAllBox() {

        for (let i = 0; i < this.grid.length; i++) {
            let Box: Graphics = this.grid[i];
            this.unselectBox(i);
            Box.tint = this.defaultTint;
            let hitbox: Graphics = this.hitboxes[i];
            hitbox.width = this.rectVars.width / 4;
            hitbox.height = this.rectVars.height / 4;
            let x = this.rectVars.X + ((this.rectVars.width / 4) * (i % 4));
            let y = this.rectVars.Y + ((this.rectVars.height / 4) * Math.floor(i / 4));
            hitbox.position = new Point(x, y);
        }
    }
    public static findBox(touchPosition: Point): number {
        let allHits: number[] = [];
        for (let i = 0; i < this.hitboxes.length; i++) {
            if (this.hitboxes[i].containsPoint(touchPosition)) allHits.push(i)
        }
        let priority: number = allHits[0];
        for (let i = 1; i < allHits.length; i++) {
            if (priority) {
                if (this.hitboxes[priority].zIndex < this.hitboxes[allHits[i]].zIndex) {
                    priority = allHits[i];
                }
            }
        }

        return priority;
    }
}