import 'zone.js';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { setLogLevel } from 'firebase/firestore';
import { LoggerService } from './app/services/logger.service';


if (environment.production) {
  enableProdMode();
}

//setLogLevel('debug');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    // Solo mostrar error en desarrollo
    if (environment.enableLogs) {
      console.error("Bootstrap error:", err);
    }
  });