import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/services/api.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  cep: string;

  latitude: number;
  longitude: number;
  zoom: number;

  propriedades;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: APIService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      params => {
        this.rua = params.rua;
        this.bairro = params.bairro;
        this.cidade = params.cidade;
        this.estado = params.estado;
        this.pais = params.pais;
        this.cep = params.cep;

        this.latitude = +params.latitude;
        this.longitude = +params.longitude;
        this.zoom = 18;

        this.apiService.getPropriedade(this.cidade, this.bairro, this.rua)
          .subscribe(
            data => {
              this.propriedades = data[0].data;
            }
          );
      }
    );
  }

  limpar() {
    this.router.navigate(['/home']);
  }
}
