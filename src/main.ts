import 'zone.js';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { setLogLevel } from 'firebase/firestore';


if (environment.production) {
  enableProdMode();
}

//setLogLevel('debug');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error("Bootstrap error:",err));