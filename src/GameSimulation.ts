import { Graphics, Point } from "pixi.js";
import { Global, Layers } from "./main";


export abstract class Wall {
    private static body: Graphics;
    private static timefortravel: number = 30//.05;
    private static distanceToTravel: number = 0;
    private static timePassed: number = 0;
    private static speed: number = 2;
    public static readonly getPosition = () => this.body.position;

    public static init() {
        let width = Global.screenData.width * .10;
        let height = Global.screenData.height * .35;
        this.body = new Graphics()
            .beginFill(0xA38DFC)
            .drawRect(0, 0, width, height)
            .endFill();
        this.body.zIndex = Layers.hitboxes;
        this.body.position = new Point(Global.screenData.width - width, Global.screenData.height * .05)
        Global.gameStage.addChild(this.body);
        this.distanceToTravel = Player.getPosition().subtract(this.body.position).magnitude();
        console.log((this.distanceToTravel/this.timefortravel) );
        
    }

    public static update() {
        // move form right to left of the screen
        //console.log(`${this.body.position} to ${this.body.position.subtract(new Point(this.speed * Global.fixedDeltaTime, 0))} `);
        // if (!Player.isDead) {
        //     this.body.position.subtract(new Point(this.speed, 0), this.body.position);
        //     if (this.body.position.x < -this.body.width) this.reset();
        // }

        if(Global.frame % Global.FPS == 0){
            this.timePassed++;
            
        } 
        
        if (this.body.position.x < -this.body.width) this.reset();
    }
    public static reset(){
        this.body.position.x = Global.screenData.width;
        this.timePassed = 0;
    }
}

export abstract class Player {
    public static isDead: boolean = false;
    private static body: Graphics;
    public static readonly getPosition = () => this.body.position;
    public static init() {
        let size = 15;
        this.body = new Graphics()
            .beginFill(0x0000FF)
            .drawCircle(0, 0, size)
            .endFill();
        this.body.zIndex = Layers.background;
        this.body.position = new Point(Global.screenData.width / 5, Global.screenData.height * .225)
        Global.gameStage.addChild(this.body);
    }
    public static update() {
        //moveing slightly up and down on like a sin wave or something
        if (!this.isDead) {
            this.body.position = new Point(this.body.x, 15 * Math.sin(.0008 * Global.fixedGameTick) + (Global.screenData.height * .225))
        } else {
            this.body.position.y += .7;
        }

        this.checkHit();

    }
    

    private static checkHit() {
        this.isDead = Wall.getPosition().x < this.body.position.x + this.body.width / 2;
    }
}

