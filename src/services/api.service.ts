import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from 'src/environments/environment';


const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class APIService {

    constructor(private http: HttpClient) { }

    // Uses http.get() to load data from a single API endpoint
    getPropriedade(cidade: string, bairro: string, rua: string) {
        return this.http
            .post(
                `${environment.apiURL}/api/propriedade`,
                {
                    paginaAtual: 1,
                    apenasAtivas: true,
                    cidade: cidade,
                    bairro: bairro,
                    rua: rua
                }
            );
    }
}