import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Http, Headers, RequestOptions, HttpModule } from '@angular/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AnnotateImageResponse, EntityAnnotation } from '@datafire/google_vision';
import 'rxjs/add/operator/finally';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  imagem: string;
  hasStreetSign: boolean;
  address: string;
  loading: any;

  constructor(
    private loadingCtrl: LoadingController,
    private camera: Camera,
    // tslint:disable-next-line: deprecation
    private http: HttpModule,
    private router: Router,
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
        this.imagem = imagemDados;

        return {
          content: this.imagem
        };
      })
      .catch(error => {
        if (error === 'cordova_not_available') {
          // Dummy when cordova not available
          this.imagem = 'https://saopauloesuasruas.files.wordpress.com/2015/05/placa-rua-s-bento.jpg';

          return {
            source: {
              imageUri: this.imagem
            }
          };
        } else {
          throw error;
        }
      })
      .then(imageRequest => {
        this.presentLoading();

        return this.requisicaoParaAPI(imageRequest);
      });
  }

  private requisicaoParaAPI(imageRequest) {
    const apiKey = 'AIzaSyBLNjgYqCgkbLFNo5vsr-2m9vb7Yp6zz8g';
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const request = {
      requests: [
        {
          image: imageRequest,
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
          this.hasStreetSign = false;
          const streetSignDescriptions = [
            'Street sign', 'Traffic sign', 'Metropolitan area'
          ];

          for (const labelAnnotation of result.responses[0].labelAnnotations) {
            if (streetSignDescriptions.some(d => labelAnnotation.description)) {
              this.hasStreetSign = true;
              this.address =
                result.responses[0]
                  .fullTextAnnotation
                  .text
                  .replace(/\n/g, ' ');
              break;
            }
          }
        },
        (error: HttpErrorResponse) => { alert(error.error.error.message); }
      );
  }

  localizarEndereco(){
    this.router.navigate(['/location', '']);
  }

  limpar() {
    this.imagem = null;
    this.hasStreetSign = null;
  }
}
