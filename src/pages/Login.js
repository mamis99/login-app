import React, { Component } from 'react';
import '../css/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Cookies from 'universal-cookie';

const baseUrl = 'http://localhost:4000/users';
const cookies = new Cookies();

class Login extends Component {
    state = {
        form: {
            username: '',
            password: ''
        }
    }

    handleChange = async e => {
        await this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: e.target.value
            }
        });
        console.log(this.state.form);
    }

    iniciarSesion = async () => {
        await axios.get(baseUrl, { params: { username: this.state.form.username, password: this.state.form.password } })
            .then(response => {
                return response.data;
            })
            .then(response => {
                if (response.length > 0) {
                    var respuesta = response[0];
                    cookies.set('id', respuesta.id, { path: "/" });
                    cookies.set('name', respuesta.name, { path: "/" });
                    cookies.set('username', respuesta.username, { path: "/" });
                    alert(respuesta.username);
                    if (this.state.form.username === 'bsalas@akubica.com') window.location.href = './menu/protected';
                    else window.location.href = './menu/unprotected';
                    
                } else {
                    alert('El usuario o la contraseña son incorrectos');
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    render() {
        return (
            <div className='containerPrincipal'>
                <div className='containerSecundario'>
                    <div className='form-group'>
                        <label>Usuario:</label>
                        <br />
                        <input
                            type="text"
                            className="form-control"
                            name='username'
                            onChange={this.handleChange}
                        />
                        <br />
                        <label>Contraseña:</label>
                        <br />
                        <input
                            type="password"
                            className="form-control"
                            name='password'
                            onChange={this.handleChange}
                        />
                        <br />
                        <button className='btn btn-primary' onClick={() => this.iniciarSesion()}>Iniciar sesión</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
