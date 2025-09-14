import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerComponent } from '@app/components/divider/divider';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [CommonModule, DividerComponent],
  templateUrl: './page-shell.html',
  styleUrls: ['./page-shell.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'page-shell' }
})
export class PageShellComponent
{
  @Input() title: string = "<Placeholder>";
  @Input() dividers: 'none' | 'top' | 'bottom' | 'both' = 'both';
}
