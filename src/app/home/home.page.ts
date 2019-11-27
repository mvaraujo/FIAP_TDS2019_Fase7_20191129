import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Headers, HttpModule } from '@angular/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AnnotateImageResponse } from '@datafire/google_vision';
import 'rxjs/add/operator/finally';
import { Router } from '@angular/router';
import { MapsAPILoader } from '@agm/core';
import { environment } from 'src/environments/environment';

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
  private geoCoder;

  constructor(
    private loadingCtrl: LoadingController,
    private camera: Camera,
    private mapsAPILoader: MapsAPILoader,
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
        this.imagem = 'data:image/jpeg;base64,' + imagemDados;

        return {
          content: imagemDados
        };
      })
      .catch(error => {
        if (error === 'cordova_not_available') {
          // Dummy when cordova not available
          this.imagem = 'https://c8.alamy.com/comp/P420BC/bairro-moema-sp-placa-placa-de-avenida-placa-de-avenida-jacutinga-placa-de-rua-de-so-paulo-bairro-moema-so-paulo-brasil-sudeste-placa-com-nome-de-ave-P420BC.jpg';

          return {
            source: {
              imageUri: this.imagem
            }
          };
        } else {
          throw error;
        }
      })
      .then(async imageRequest => {
        this.presentLoading();

        await this.loadMapsAPI();

        return this.requisicaoParaAPI(imageRequest);
      });
  }

  private async loadMapsAPI() {
    const result =
      this.mapsAPILoader
        .load()
        .then(
          () => {
            this.geoCoder = new google.maps.Geocoder();
          }
        );

    return result;
  }

  private requisicaoParaAPI(imageRequest) {
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${environment.googleCloudVisionAPIKey}`;
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
            if (streetSignDescriptions.some(d => d === labelAnnotation.description)) {
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

  localizarEndereco() {
    this.geoCoder.geocode(
      { address: this.address }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            const address_components = results[0].address_components;

            const rua = address_components.filter(a => a.types.some(t => t == "route"))[0].short_name;
            const bairro =  address_components.filter(a => a.types.some(t => t == "administrative_area_level_4"))[0].short_name;
            const cidade =  address_components.filter(a => a.types.some(t => t == "administrative_area_level_2"))[0].short_name;
            const estado =  address_components.filter(a => a.types.some(t => t == "administrative_area_level_1"))[0].short_name;
            const pais =  address_components.filter(a => a.types.some(t => t == "country"))[0].short_name;
            const cep =  address_components.filter(a => a.types.some(t => t == "postal_code"))[0].short_name;

            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();

            this.router.navigate(['/location', rua, bairro, cidade, estado, pais, cep, lat, lng]);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
  }

  limpar() {
    this.imagem = null;
    this.hasStreetSign = null;
  }
}
