import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Http, Headers, RequestOptions, HttpModule } from '@angular/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AnnotateImageResponse, EntityAnnotation } from '@datafire/google_vision';
import 'rxjs/add/operator/finally';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  imagem: string;
  loading: any;

  constructor(
    private loadingCtrl: LoadingController,
    private camera: Camera,
    // tslint:disable-next-line: deprecation
    private http: HttpModule,
    private httpClient: HttpClient
  ) { }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Processando'
    });
    await this.loading.present();
  }

  async dismissLoading() {
    this.loading.dismiss();
  }

  tirarFoto() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options)
      .then(imagemDados => {
        this.imagem = 'data:image/jpeg;base64,' + imagemDados;
        return imagemDados;
      })
      .then(imagem => {
        this.presentLoading();

        return this.requisicaoParaAPI(imagem);
      });
  }

  requisicaoParaAPI(imagemBase64) {
    const apiKey = 'AIzaSyBLNjgYqCgkbLFNo5vsr-2m9vb7Yp6zz8g';
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const request = {
      requests: [
        {
          image: {
            content: imagemBase64
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 50
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION'
            }
          ]
        }
      ]
    }

    // tslint:disable-next-line: deprecation
    const headers = new Headers({ 'Content-Type': 'application/json' });

    this.httpClient
      .post(url, request)
      .finally(
        () => { this.dismissLoading(); }
      )
      .subscribe(
        (result: AnnotateImageResponse) => {
          let hasStreetSign = false;

          for (const labelAnnotation of result.responses[0].labelAnnotations) {
            if (labelAnnotation.description === 'Street sign') {
              hasStreetSign = true;
              break;
            }
          }

          if (!hasStreetSign) {
            alert(
              'Isso não parece uma placa de rua!\n' +
              'Por favor, tente de novo'
            );
          } else {
            alert(
              'A rua foi identificada\n' +
              'Iremos mostrá-la no mapa!'
            );
          }
        },
        (error: HttpErrorResponse) => { alert(error.error.error.message); }
      );
  }
}
