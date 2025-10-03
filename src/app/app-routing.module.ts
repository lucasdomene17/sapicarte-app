import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { SobreComponent } from './components/sobre/sobre.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { PreciosComponent } from './components/precios/precios.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { FaqComponent } from './components/faq/faq.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';


const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sobre', component: SobreComponent },
  { path: 'galeria', component: GaleriaComponent },
  { path: 'precios', component: PreciosComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'preguntas-frecuentes', component: FaqComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
