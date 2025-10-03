import { Component } from '@angular/core';

interface MediaItem {
  src: string;
  type: 'image' | 'video';
  alt?: string;
}

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent {
  mediaItems: MediaItem[] = [
    { src: 'assets/galeria/galeria1.jpg', type: 'image', alt: 'Foto de SalpicArte 1' },
    { src: 'assets/galeria/video1.mp4', type: 'video', alt: 'Video de SalpicArte 1' },
    { src: 'assets/galeria/galeria2.jpg', type: 'image', alt: 'Foto de SalpicArte 2' },
    { src: 'assets/galeria/galeria3.jpg', type: 'image', alt: 'Foto de SalpicArte 3' },
    { src: 'assets/galeria/video2.mp4', type: 'video', alt: 'Video de SalpicArte 2' },
    { src: 'assets/galeria/galeria4.jpg', type: 'image', alt: 'Foto de SalpicArte 4' },
    { src: 'assets/galeria/galeria5.jpg', type: 'image', alt: 'Foto de SalpicArte 5' },
    { src: 'assets/galeria/galeria6.jpg', type: 'image', alt: 'Foto de SalpicArte 6' },
    { src: 'assets/galeria/video3.mp4', type: 'video', alt: 'Video de SalpicArte 3' }
  ];

  onVideoMouseEnter(videoElement: HTMLVideoElement): void {
    videoElement.muted = true; // Necesario para autoplay en navegadores
    videoElement.play().catch(error => {
      console.warn('Error al reproducir video:', error);
    });
  }

  onVideoMouseLeave(videoElement: HTMLVideoElement): void {
    videoElement.pause();
    videoElement.currentTime = 0; // Reinicia el video al principio
  }

  onVideoFocus(videoElement: HTMLVideoElement): void {
    videoElement.muted = true;
    videoElement.play().catch(error => {
      console.warn('Error al reproducir video:', error);
    });
  }

  onVideoBlur(videoElement: HTMLVideoElement): void {
    videoElement.pause();
    videoElement.currentTime = 0;
  }

  onVideoTouchStart(videoElement: HTMLVideoElement): void {
    // Para dispositivos móviles, alternar reproducción
    if (videoElement.paused) {
      videoElement.muted = true;
      videoElement.play().catch(error => {
        console.warn('Error al reproducir video:', error);
      });
    } else {
      videoElement.pause();
    }
  }
}