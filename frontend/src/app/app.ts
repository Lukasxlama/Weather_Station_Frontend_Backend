import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@app/components/navbar/navbar';
import { BackgroundComponent } from "@app/components/background/background";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, BackgroundComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { protected readonly title = signal('Wetterstation'); }
