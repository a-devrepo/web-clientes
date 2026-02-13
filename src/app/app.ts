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
  listaClientes = signal<any[]>([]);
  clienteSelecionadoParaExclusao = signal<any>(null);
  clienteSelecionadoParaAtualizacao = signal<any>(null);

  apiUrl = 'http://localhost:8081/api/v1/clientes';

  formCadastro = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.minLength(11),
    ]),
  });

  formEdicao = new FormGroup({
    id: new FormControl(''),
    nome: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.minLength(11),
    ]),
  });

  formConsulta = new FormGroup({
  nome: new FormControl('', [Validators.required, Validators.minLength(6)])
});

listarTodos() {
  this.httpClient.get<any[]>(this.apiUrl).subscribe({
    next: (data) => {
      this.listaClientes.set(data);
    },
    error: (err) => console.error('Erro ao listar todos', err)
  });
}

  cadastrar() {

    if (this.formCadastro.invalid) {
      return;
    }

    const novoCliente = this.formCadastro.getRawValue();

    this.httpClient
      .post(this.apiUrl, novoCliente, {responseType: 'text'})
      .subscribe(
        {
        next: (data: any) => {
          this.mensagemSucesso.set(data);
          this.formCadastro.reset();
        },
        error: (err:any) => {
          console.log(err);
          this.mensagemErro.set(err.error);
        },
      });
  }

  consultar() {

    const nome = this.formConsulta.controls.nome.value;

    if(!nome){
      this.listarTodos();
      return;
    }

    this.httpClient
      .get(`${this.apiUrl}/${nome}`)
      .subscribe(
        {
        next: (data) => {
          this.listaClientes.set(data as any);
          // this.formConsulta.reset();
        },
        error: (err:any) => {
          console.log(err);
          this.mensagemErro.set(err.error);
        },
      });
  }

  excluir() {

  const id = this.clienteSelecionadoParaExclusao().id;

    this.httpClient
      .delete(`${this.apiUrl}/${id}`, {responseType: 'text'})
      .subscribe(
        {
        next:(response) => {
          this.mensagemSucesso.set(response);
          this.consultar();
        },
        error: (err:any) => {
          this.mensagemErro.set(err.error);
        },
      });
  }

  prepararEdicao(cliente:any){
    this.clienteSelecionadoParaAtualizacao.set(cliente);
    this.formEdicao.patchValue(cliente);
  }

  atualizar(){

    const dadosClienteAtualizado = this.formEdicao.getRawValue();
    const id = dadosClienteAtualizado.id;

    this.httpClient
      .put(`${this.apiUrl}/${id}`,dadosClienteAtualizado, {responseType: 'text'})
      .subscribe(
        {
        next:(response) => {
          this.mensagemSucesso.set(response);
          this.consultar();
        },
        error: (err:any) => {
          this.mensagemErro.set(err.error);
        },
      });
  }
}
