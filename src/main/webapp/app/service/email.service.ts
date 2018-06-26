import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class EmailService {

    constructor(private http:  HttpClient) { }

    sendEmail(data: object) {
        const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
        // HttpParam is immutable and append() returns a new HttpParams object.
        // We chain our append calls, creating a new HttpParams object on each call. The last time we call append,
        // the HttpParams object returned will contain all of the previously appended parameters.
        const body = new HttpParams()
        .append('sendTo', data['sendTo'])
        .append('subject', data['subject'])
        .append('content', data['content']);
        return this.http.post('http://oncokb.org/legacy-api/sendEmail', body, { 'headers': headers })
            .subscribe(
            (res) => {
                if (res) {
                    console.log('Send email successfully.');
                } else {
                    console.log('Send email failed.');
                }
            },
            (error) => console.log('Send email failed.', error)
            );
    }
}
