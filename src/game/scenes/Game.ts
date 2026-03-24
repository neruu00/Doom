import { Scene } from 'phaser';

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 2, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const MAP_WIDTH = map[0].length;
const MAP_HEIGHT = map.length;

export class Game extends Scene {
    private graphics: Phaser.GameObjects.Graphics;
    private player = {
        x: 3.5,
        y: 3.5,
        dirX: 1,
        dirY: 0,
        planeX: 0,
        planeY: 0.66 // FOV multiplier
    };

    // keys
    private keyW: Phaser.Input.Keyboard.Key;
    private keyQ: Phaser.Input.Keyboard.Key;
    private keyE: Phaser.Input.Keyboard.Key;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    private shootTimer: number = 0;

    constructor() {
        super('Game');
    }

    create() {
        this.graphics = this.add.graphics();

        if (this.input.keyboard) {
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
            this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    update(_time: number, delta: number) {
        const dt = Math.min(delta, 50);
        const moveSpeed = dt * 0.005;
        const rotSpeed = dt * 0.003;

        // Forward and backward movement
        if (this.cursors?.up?.isDown) {
            if (map[Math.floor(this.player.y)][Math.floor(this.player.x + this.player.dirX * moveSpeed)] === 0)
                this.player.x += this.player.dirX * moveSpeed;
            if (map[Math.floor(this.player.y + this.player.dirY * moveSpeed)][Math.floor(this.player.x)] === 0)
                this.player.y += this.player.dirY * moveSpeed;
        }
        if (this.cursors?.down?.isDown) {
            if (map[Math.floor(this.player.y)][Math.floor(this.player.x - this.player.dirX * moveSpeed)] === 0)
                this.player.x -= this.player.dirX * moveSpeed;
            if (map[Math.floor(this.player.y - this.player.dirY * moveSpeed)][Math.floor(this.player.x)] === 0)
                this.player.y -= this.player.dirY * moveSpeed;
        }

        // Strafe
        const strafeDirX = this.player.dirY;
        const strafeDirY = -this.player.dirX;

        // SWAPPED left and right strafe controls 
        if (this.cursors?.left?.isDown) {
            if (map[Math.floor(this.player.y)][Math.floor(this.player.x + strafeDirX * moveSpeed)] === 0)
                this.player.x += strafeDirX * moveSpeed;
            if (map[Math.floor(this.player.y + strafeDirY * moveSpeed)][Math.floor(this.player.x)] === 0)
                this.player.y += strafeDirY * moveSpeed;
        }

        if (this.cursors?.right?.isDown) {
            if (map[Math.floor(this.player.y)][Math.floor(this.player.x - strafeDirX * moveSpeed)] === 0)
                this.player.x -= strafeDirX * moveSpeed;
            if (map[Math.floor(this.player.y - strafeDirY * moveSpeed)][Math.floor(this.player.x)] === 0)
                this.player.y -= strafeDirY * moveSpeed;
        }

        // Rotation
        if (this.keyQ?.isDown) {
            const oldDirX = this.player.dirX;
            this.player.dirX = this.player.dirX * Math.cos(-rotSpeed) - this.player.dirY * Math.sin(-rotSpeed);
            this.player.dirY = oldDirX * Math.sin(-rotSpeed) + this.player.dirY * Math.cos(-rotSpeed);
            const oldPlaneX = this.player.planeX;
            this.player.planeX = this.player.planeX * Math.cos(-rotSpeed) - this.player.planeY * Math.sin(-rotSpeed);
            this.player.planeY = oldPlaneX * Math.sin(-rotSpeed) + this.player.planeY * Math.cos(-rotSpeed);
        }
        if (this.keyE?.isDown) {
            const oldDirX = this.player.dirX;
            this.player.dirX = this.player.dirX * Math.cos(rotSpeed) - this.player.dirY * Math.sin(rotSpeed);
            this.player.dirY = oldDirX * Math.sin(rotSpeed) + this.player.dirY * Math.cos(rotSpeed);
            const oldPlaneX = this.player.planeX;
            this.player.planeX = this.player.planeX * Math.cos(rotSpeed) - this.player.planeY * Math.sin(rotSpeed);
            this.player.planeY = oldPlaneX * Math.sin(rotSpeed) + this.player.planeY * Math.cos(rotSpeed);
        }

        // Shooting Timer logic
        if (this.shootTimer > 0) {
            this.shootTimer = Math.max(0, this.shootTimer - dt);
        }

        // Shooting Input
        if (this.keyW && Phaser.Input.Keyboard.JustDown(this.keyW) && this.shootTimer === 0) {
            this.shootTimer = 150; // 150ms shot duration
            // Add a simple screen shake
            this.cameras.main.shake(100, 0.01);
        }

        this.renderRaycaster();
    }

    renderRaycaster() {
        this.graphics.clear();

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Draw ceiling
        this.graphics.fillStyle(0x383838);
        this.graphics.fillRect(0, 0, screenWidth, screenHeight / 2);

        // Draw floor
        this.graphics.fillStyle(0x707070);
        this.graphics.fillRect(0, screenHeight / 2, screenWidth, screenHeight / 2);

        for (let x = 0; x < screenWidth; x += 2) { 
            const cameraX = 2 * x / screenWidth - 1; 
            const rayDirX = this.player.dirX + this.player.planeX * cameraX;
            const rayDirY = this.player.dirY + this.player.planeY * cameraX;

            let mapX = Math.floor(this.player.x);
            let mapY = Math.floor(this.player.y);

            let sideDistX: number;
            let sideDistY: number;

            const deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
            const deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);
            let perpWallDist: number;

            let stepX: number;
            let stepY: number;

            let hit = 0; 
            let side = 0; 

            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (this.player.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX;
            }
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (this.player.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY;
            }

            let ddaSteps = 0;
            while (hit === 0 && ddaSteps < 50) { 
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                if (mapX < 0 || mapX >= MAP_WIDTH || mapY < 0 || mapY >= MAP_HEIGHT) {
                    hit = 1; 
                } else if (map[mapY][mapX] > 0) {
                    hit = 1;
                }
                ddaSteps++;
            }

            if (side === 0) {
                perpWallDist = (sideDistX - deltaDistX);
            } else {
                perpWallDist = (sideDistY - deltaDistY);
            }

            perpWallDist = Math.max(perpWallDist, 0.0001);
            const lineHeight = Math.floor(screenHeight / perpWallDist);

            let drawStart = Math.floor(-lineHeight / 2 + screenHeight / 2);
            if (drawStart < 0) drawStart = 0;
            let drawEnd = Math.floor(lineHeight / 2 + screenHeight / 2);
            if (drawEnd >= screenHeight) drawEnd = screenHeight - 1;

            let color = 0x00FF00;
            if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                if (map[mapY][mapX] == 1) color = 0xAA2222; // red
                if (map[mapY][mapX] == 2) color = 0x2222AA; // blue
            }

            let r = (color >> 16) & 0xff;
            let g = (color >> 8) & 0xff;
            let b = color & 0xff;

            if (side === 1) {
                r *= 0.6; g *= 0.6; b *= 0.6;
            }

            const fogDist = Math.max(0, Math.min(1, 1 - (perpWallDist / 12)));
            r *= fogDist; g *= fogDist; b *= fogDist;

            const finalColor = Phaser.Display.Color.GetColor(Math.floor(r), Math.floor(g), Math.floor(b));

            this.graphics.fillStyle(finalColor);
            this.graphics.fillRect(x, drawStart, 2, drawEnd - drawStart);
        }

        this.renderGun(screenWidth, screenHeight);
    }

    renderGun(screenWidth: number, screenHeight: number) {
        const gunX = screenWidth / 2;
        const gunY = screenHeight;

        let kickY = 0;
        let kickX = 0;
        
        if (this.shootTimer > 0) {
            if (this.shootTimer > 100) {
                kickY = (150 - this.shootTimer) * 1.0; 
                kickX = (150 - this.shootTimer) * 0.25; 
            } else {
                kickY = this.shootTimer * 0.5;
                kickX = this.shootTimer * 0.12;
            }
        }

        const barrelTopW = 28;
        const barrelBotW = 120;
        const gunHeight = 196; // 70% of 280
        
        const topY = gunY - gunHeight + kickY + 40;
        const botY = gunY + kickY + 40;

        // Base/Left Dark Grey shape
        this.graphics.fillStyle(0x333333);
        this.graphics.beginPath();
        this.graphics.moveTo(gunX - barrelTopW/2 + kickX, topY);
        this.graphics.lineTo(gunX + kickX, topY);
        this.graphics.lineTo(gunX + kickX, botY);
        this.graphics.lineTo(gunX - barrelBotW/2 + kickX, botY);
        this.graphics.closePath();
        this.graphics.fillPath();

        // Right Darker Grey shape
        this.graphics.fillStyle(0x1a1a1a);
        this.graphics.beginPath();
        this.graphics.moveTo(gunX + kickX, topY);
        this.graphics.lineTo(gunX + barrelTopW/2 + kickX, topY);
        this.graphics.lineTo(gunX + barrelBotW/2 + kickX, botY);
        this.graphics.lineTo(gunX + kickX, botY);
        this.graphics.closePath();
        this.graphics.fillPath();

        // Center Highlight (Metallic reflection)
        this.graphics.fillStyle(0x888899);
        this.graphics.beginPath();
        this.graphics.moveTo(gunX - barrelTopW/4 + kickX, topY);
        this.graphics.lineTo(gunX + barrelTopW/6 + kickX, topY);
        this.graphics.lineTo(gunX + barrelBotW/8 + kickX, botY);
        this.graphics.lineTo(gunX - barrelBotW/6 + kickX, botY);
        this.graphics.closePath();
        this.graphics.fillPath();
        
        // Front sight
        this.graphics.fillStyle(0xaaaaaa);
        this.graphics.beginPath();
        this.graphics.moveTo(gunX - 2 + kickX, topY);
        this.graphics.lineTo(gunX + 2 + kickX, topY);
        this.graphics.lineTo(gunX + kickX, topY - 8);
        this.graphics.closePath();
        this.graphics.fillPath();
        
        // Hands holding the gun
        this.graphics.fillStyle(0xcc8866); // hand skin color
        
        // Left hand thumb area
        this.graphics.fillCircle(gunX - barrelBotW/2 + 10 + kickX, botY - 50, 25);
        this.graphics.fillCircle(gunX - barrelBotW/2 + 5 + kickX, botY - 20, 30);
        // Right hand fingers wrapping around
        this.graphics.fillCircle(gunX + barrelBotW/2 - 10 + kickX, botY - 45, 20);
        this.graphics.fillCircle(gunX + barrelBotW/2 - 20 + kickX, botY - 20, 28);
        this.graphics.fillCircle(gunX + barrelBotW/2 - 5 + kickX, botY, 35);

        // Muzzle flash
        if (this.shootTimer > 100) {
            const sizeMultiplier = (this.shootTimer - 100) / 50; // 0 to 1
            const flashY = topY - 20;
            const flashX = gunX + kickX;

            this.graphics.fillStyle(0xFF8800, 0.8);
            this.graphics.fillCircle(flashX, flashY, 90 * sizeMultiplier);
            
            this.graphics.fillStyle(0xFFDD00, 0.9);
            this.graphics.fillCircle(flashX, flashY, 55 * sizeMultiplier);
            
            this.graphics.fillStyle(0xFFFFFF, 1.0);
            this.graphics.fillCircle(flashX, flashY, 30 * sizeMultiplier);
        }
    }
}
