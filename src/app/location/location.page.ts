import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  latitude: number;
  longitude: number;
  zoom: number;

  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      params => {
        this.latitude = +params.latitude;
        this.longitude = +params.longitude;
        this.zoom = 18;
      }
    );
  }

  limpar() {
    this.router.navigate(['/home']);
  }
}
