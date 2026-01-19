import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";

import { CarouselModule } from 'ngx-bootstrap/carousel';

@Component({
  selector: 'app-login',
  imports: [CarouselModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
