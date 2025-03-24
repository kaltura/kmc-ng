import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
    selector: 'kSpaceship',
    template: `
        <div class="spaceship">
            <div *ngFor="let led of leds" class="led" [class.on]="led"></div>
        </div>
    `,
    styles: [`
        .spaceship {
            transform: scale(1);
            width: 424px;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
            align-content: flex-start;
            padding: 8px;
            gap: 8px;
        }
        .spaceship .led {
            width: 8px; height: 8px;
            background-color: #B6D7FF;
            border-radius:4px;
            transition: background 300ms;
        }
        .spaceship .led.on {
            background-color: #006efa;
        }
    `]
})
export class Spaceship implements  OnInit, OnDestroy {
    private LED_COUNT = 156;
	public leds: boolean[] = [];
    private intervalId: any = null;

    ngOnInit(): void {
        for (let i = 0; i < this.LED_COUNT; i++) {
            this.leds.push(false);
        }

        this.intervalId = setInterval(() => {
            const randomNumber = Math.floor(Math.random() * (this.LED_COUNT - 1)) + 1;
            this.leds[randomNumber] = !this.leds[randomNumber];
        }, 70);
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

}

