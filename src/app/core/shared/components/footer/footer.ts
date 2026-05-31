import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Mail, Phone, LucideAngularModule } from 'lucide-angular';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe, LucideAngularModule, Brand],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly icons = {
    mail: Mail,
    phone: Phone,
  };

  readonly developerName = 'Ilyas MARDHI';
  readonly developerEmail = 'ilyasmardhi1@gmail.com';
  readonly developerPhone = '+212 6 88 59 25 18';
}