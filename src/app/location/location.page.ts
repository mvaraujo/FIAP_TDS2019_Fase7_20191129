import { Component, OnInit } from '@angular/core';

declare var google;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  map: any;

  constructor() { }

  ngOnInit() {
    const position = new google.maps.LatLng(-21.763409, -43.349034);

    const mapOptions = {
      zoom: 18,
      center: position,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }

  private getMapa() {
    return 'https://maps.googleapis.com/maps/api/staticmap?zoom=15&size=400x400&markers=color:red|RUA 540 BENTO DE São Bento SE-Sé CEP 01011-100 Rua São Bento 323 a 413 FOTO POR GCalixto&key=AIzaSyBLNjgYqCgkbLFNo5vsr-2m9vb7Yp6zz8g'
  }

}
