import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private httpClient = inject(HttpClient);

  mensagemErro = signal<string>('');
  mensagemSucesso = signal<string>('');

  formulario = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.minLength(11),
    ]),
  });

  cadastrar() {
    
    if (this.formulario.invalid) {
      return;
    }

    const novoCliente = this.formulario.getRawValue();

    this.httpClient
      .post('http://localhost:8081/api/v1/clientes', novoCliente, {responseType: 'text'})
      .subscribe(
        {
        next: (data: any) => {
          this.mensagemSucesso.set(data);
          this.formulario.reset();
        },
        error: (err:any) => {
          console.log(err);
          this.mensagemErro.set(err.error);
        },
      });
  }
}
