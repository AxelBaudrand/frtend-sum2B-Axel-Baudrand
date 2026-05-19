document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector(".formulario-registro");
    const presentacion = document.querySelector(".presentacion");

    const campos = {
        nombreDuenio: document.getElementById("nombre-duenio"),
        fechaNacimientoDuenio: document.getElementById("fecha-nacimiento-duenio"),
        dni: document.getElementById("dni"),
        telefono: document.getElementById("telefono"),
        correo: document.getElementById("correo"),
        confirmarCorreo: document.getElementById("confirmar-correo"),
        contrasena: document.getElementById("contrasena"),
        confirmarContrasena: document.getElementById("confirmar-contrasena"),
        direccion: document.getElementById("direccion"),
        localidad: document.getElementById("localidad"),
        provincia: document.getElementById("provincia"),
        nombreMascota: document.getElementById("nombre-mascota"),
        especie: document.getElementById("especie"),
        otraEspecie: document.getElementById("otra-especie"),
        raza: document.getElementById("raza"),
        fechaNacimientoMascota: document.getElementById("fecha-nacimiento-mascota"),
        condicionesMedicas: document.getElementById("condiciones-medicas"),
        numeroMicrochip: document.getElementById("numero-microchip"),
        frecuenciaVisitas: document.getElementById("frecuencia-visitas"),
        observaciones: document.getElementById("observaciones"),
        microchip: document.getElementById("microchip"),
        terminos: document.getElementById("terminos"),
        privacidad: document.getElementById("privacidad")
    };

    const grupos = {
        sexo: document.querySelector('input[name="sexo"]').closest(".grupo-opciones"),
        servicios: document.querySelector('input[name="servicios"]').closest(".grupo-opciones"),
        turno: document.querySelector('input[name="turno-preferido"]').closest(".grupo-opciones"),
        autorizaciones: campos.terminos.closest(".grupo-opciones")
    };

    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexContrasena = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const regexTelefono = /^[0-9+\-\s]+$/;

    prepararResumenErrores();
    prepararCamposDinamicos();
    crearContador(campos.condicionesMedicas, 250);
    crearContador(campos.observaciones, 300);
    conectarValidacionesEnTiempoReal();

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const errores = validarFormularioCompleto();

        if (errores.length > 0) {
            mostrarResumenErrores(errores.length);
            errores[0].elemento.scrollIntoView({ behavior: "smooth", block: "center" });
            errores[0].elemento.focus();
            return;
        }

        limpiarResumenErrores();
        mostrarConfirmacion();
    });

    formulario.addEventListener("reset", function () {
        setTimeout(function () {
            limpiarEstados();
            prepararCamposDinamicos();
            actualizarContador(campos.condicionesMedicas, 250);
            actualizarContador(campos.observaciones, 300);
            limpiarResumenErrores();
        }, 0);
    });

    function prepararResumenErrores() {
        const resumen = document.createElement("div");
        resumen.id = "resumen-errores";
        resumen.className = "resumen-errores";
        resumen.setAttribute("aria-live", "polite");
        formulario.before(resumen);
    }

    function prepararCamposDinamicos() {
        mostrarUOcultarCampo(campos.otraEspecie.closest(".campo"), campos.especie.value === "otro");
        mostrarUOcultarCampo(campos.numeroMicrochip.closest(".campo"), campos.microchip.checked);

        if (campos.especie.value !== "otro") {
            campos.otraEspecie.value = "";
            limpiarEstado(campos.otraEspecie);
        }

        if (!campos.microchip.checked) {
            campos.numeroMicrochip.value = "";
            limpiarEstado(campos.numeroMicrochip);
        }
    }

    function mostrarUOcultarCampo(contenedor, debeMostrarse) {
        contenedor.style.display = debeMostrarse ? "flex" : "none";
    }

    function crearContador(campo, limite) {
        const contador = document.createElement("small");
        contador.className = "contador-caracteres";
        campo.after(contador);
        actualizarContador(campo, limite);

        campo.addEventListener("input", function () {
            actualizarContador(campo, limite);
        });
    }

    function actualizarContador(campo, limite) {
        const contador = campo.parentElement.querySelector(".contador-caracteres");
        const usados = campo.value.length;

        if (!contador) {
            return;
        }

        contador.textContent = usados + " / " + limite + " caracteres";
        contador.classList.toggle("contador-alerta", usados >= limite * 0.8);
    }

    function conectarValidacionesEnTiempoReal() {
        const validacionesPorCampo = [
            [campos.nombreDuenio, validarNombreDuenio],
            [campos.fechaNacimientoDuenio, validarFechaNacimientoDuenio],
            [campos.dni, validarDni],
            [campos.telefono, validarTelefono],
            [campos.correo, validarCorreo],
            [campos.confirmarCorreo, validarConfirmarCorreo],
            [campos.contrasena, validarContrasena],
            [campos.confirmarContrasena, validarConfirmarContrasena],
            [campos.direccion, validarDireccion],
            [campos.localidad, validarLocalidad],
            [campos.provincia, validarProvincia],
            [campos.nombreMascota, validarNombreMascota],
            [campos.especie, validarEspecie],
            [campos.otraEspecie, validarOtraEspecie],
            [campos.raza, validarRaza],
            [campos.fechaNacimientoMascota, validarFechaNacimientoMascota],
            [campos.condicionesMedicas, validarAlergias],
            [campos.numeroMicrochip, validarNumeroMicrochip],
            [campos.frecuenciaVisitas, validarFrecuenciaVisitas],
            [campos.observaciones, validarObservaciones]
        ];

        validacionesPorCampo.forEach(function (par) {
            const campo = par[0];
            const validar = par[1];

            campo.addEventListener("input", validar);
            campo.addEventListener("blur", validar);
            campo.addEventListener("change", validar);
        });

        campos.especie.addEventListener("change", function () {
            prepararCamposDinamicos();
            validarEspecie();
            validarOtraEspecie();
        });

        campos.microchip.addEventListener("change", function () {
            prepararCamposDinamicos();
            validarNumeroMicrochip();
        });

        document.querySelectorAll('input[name="sexo"]').forEach(function (radio) {
            radio.addEventListener("change", validarSexo);
        });

        document.querySelectorAll('input[name="servicios"]').forEach(function (checkbox) {
            checkbox.addEventListener("change", validarServicios);
        });

        document.querySelectorAll('input[name="turno-preferido"]').forEach(function (radio) {
            radio.addEventListener("change", validarTurno);
        });

        campos.terminos.addEventListener("change", validarAutorizaciones);
        campos.privacidad.addEventListener("change", validarAutorizaciones);
    }

    function validarFormularioCompleto() {
        const resultados = [
            validarNombreDuenio(),
            validarFechaNacimientoDuenio(),
            validarDni(),
            validarCorreo(),
            validarConfirmarCorreo(),
            validarContrasena(),
            validarConfirmarContrasena(),
            validarTelefono(),
            validarDireccion(),
            validarLocalidad(),
            validarProvincia(),
            validarNombreMascota(),
            validarEspecie(),
            validarOtraEspecie(),
            validarRaza(),
            validarSexo(),
            validarFechaNacimientoMascota(),
            validarNumeroMicrochip(),
            validarAlergias(),
            validarServicios(),
            validarTurno(),
            validarFrecuenciaVisitas(),
            validarObservaciones(),
            validarAutorizaciones()
        ];

        return resultados.filter(function (resultado) {
            return !resultado.valido;
        });
    }

    function validarNombreDuenio() {
        const valor = obtenerValor(campos.nombreDuenio);

        if (valor.length < 5 || valor.length > 80) {
            return marcarError(campos.nombreDuenio, "El nombre debe tener entre 5 y 80 caracteres.");
        }

        if (!regexSoloLetras.test(valor)) {
            return marcarError(campos.nombreDuenio, "El nombre solo puede contener letras y espacios.");
        }

        return marcarOk(campos.nombreDuenio);
    }

    function validarFechaNacimientoDuenio() {
        if (!campos.fechaNacimientoDuenio.value) {
            return marcarError(campos.fechaNacimientoDuenio, "La fecha de nacimiento es obligatoria.");
        }

        if (calcularEdad(campos.fechaNacimientoDuenio.value) < 18) {
            return marcarError(campos.fechaNacimientoDuenio, "El dueño debe ser mayor de 18 años.");
        }

        return marcarOk(campos.fechaNacimientoDuenio);
    }

    function validarDni() {
        if (!/^\d{7,8}$/.test(obtenerValor(campos.dni))) {
            return marcarError(campos.dni, "El DNI debe tener solo numeros y entre 7 y 8 digitos.");
        }

        return marcarOk(campos.dni);
    }

    function validarCorreo() {
        if (!regexCorreo.test(obtenerValor(campos.correo))) {
            return marcarError(campos.correo, "Ingresa un correo electronico valido.");
        }

        if (campos.confirmarCorreo.value) {
            validarConfirmarCorreo();
        }

        return marcarOk(campos.correo);
    }

    function validarConfirmarCorreo() {
        if (!obtenerValor(campos.confirmarCorreo)) {
            return marcarError(campos.confirmarCorreo, "Confirma tu correo electronico.");
        }

        if (obtenerValor(campos.confirmarCorreo) !== obtenerValor(campos.correo)) {
            return marcarError(campos.confirmarCorreo, "El correo de confirmacion debe coincidir.");
        }

        return marcarOk(campos.confirmarCorreo);
    }

    function validarContrasena() {
        if (!regexContrasena.test(campos.contrasena.value)) {
            return marcarError(campos.contrasena, "La contrasena debe tener 8 caracteres, una mayuscula, un numero y un caracter especial.");
        }

        if (campos.confirmarContrasena.value) {
            validarConfirmarContrasena();
        }

        return marcarOk(campos.contrasena);
    }

    function validarConfirmarContrasena() {
        if (campos.confirmarContrasena.value !== campos.contrasena.value || !campos.confirmarContrasena.value) {
            return marcarError(campos.confirmarContrasena, "La confirmacion debe coincidir con la contrasena.");
        }

        return marcarOk(campos.confirmarContrasena);
    }

    function validarTelefono() {
        const valor = obtenerValor(campos.telefono);
        const cantidadDigitos = valor.replace(/\D/g, "").length;

        if (!regexTelefono.test(valor) || cantidadDigitos < 8) {
            return marcarError(campos.telefono, "El telefono debe tener al menos 8 digitos y solo puede usar numeros, espacios, guiones o +.");
        }

        return marcarOk(campos.telefono);
    }

    function validarDireccion() {
        return validarTextoMinimo(campos.direccion, 3, "La direccion debe tener al menos 3 caracteres.");
    }

    function validarLocalidad() {
        return validarTextoMinimo(campos.localidad, 3, "La localidad debe tener al menos 3 caracteres.");
    }

    function validarProvincia() {
        if (!campos.provincia.value) {
            return marcarError(campos.provincia, "Selecciona una provincia.");
        }

        return marcarOk(campos.provincia);
    }

    function validarNombreMascota() {
        const valor = obtenerValor(campos.nombreMascota);

        if (valor.length < 2) {
            return marcarError(campos.nombreMascota, "El nombre de la mascota debe tener al menos 2 caracteres.");
        }

        if (!regexSoloLetras.test(valor)) {
            return marcarError(campos.nombreMascota, "El nombre de la mascota solo puede tener letras y espacios.");
        }

        return marcarOk(campos.nombreMascota);
    }

    function validarEspecie() {
        if (!campos.especie.value) {
            return marcarError(campos.especie, "Selecciona una especie.");
        }

        return marcarOk(campos.especie);
    }

    function validarOtraEspecie() {
        if (campos.especie.value !== "otro") {
            limpiarEstado(campos.otraEspecie);
            return { valido: true, elemento: campos.otraEspecie };
        }

        return validarTextoMinimo(campos.otraEspecie, 2, "Indica la especie de la mascota.");
    }

    function validarRaza() {
        return validarTextoMinimo(campos.raza, 2, "La raza es obligatoria y debe tener al menos 2 caracteres.");
    }

    function validarSexo() {
        const seleccionado = document.querySelector('input[name="sexo"]:checked');

        if (!seleccionado) {
            return marcarError(grupos.sexo, "Selecciona el sexo de la mascota.");
        }

        return marcarOk(grupos.sexo);
    }

    function validarFechaNacimientoMascota() {
        const fecha = campos.fechaNacimientoMascota.value;

        if (!fecha) {
            limpiarEstado(campos.fechaNacimientoMascota);
            return { valido: true, elemento: campos.fechaNacimientoMascota };
        }

        const fechaIngresada = new Date(fecha + "T00:00:00");
        const hoy = new Date();

        if (fechaIngresada > hoy) {
            return marcarError(campos.fechaNacimientoMascota, "La fecha de nacimiento no puede ser futura.");
        }

        if (calcularEdad(fecha) > 30) {
            return marcarError(campos.fechaNacimientoMascota, "La mascota no puede tener mas de 30 anos.");
        }

        return marcarOk(campos.fechaNacimientoMascota);
    }

    function validarNumeroMicrochip() {
        if (!campos.microchip.checked) {
            limpiarEstado(campos.numeroMicrochip);
            return { valido: true, elemento: campos.numeroMicrochip };
        }

        if (!/^\d{9,15}$/.test(obtenerValor(campos.numeroMicrochip))) {
            return marcarError(campos.numeroMicrochip, "El numero de microchip debe tener entre 9 y 15 digitos.");
        }

        return marcarOk(campos.numeroMicrochip);
    }

    function validarAlergias() {
        if (campos.condicionesMedicas.value.length > 250) {
            return marcarError(campos.condicionesMedicas, "Las alergias no pueden superar los 250 caracteres.");
        }

        return marcarOk(campos.condicionesMedicas);
    }

    function validarServicios() {
        const seleccionados = document.querySelectorAll('input[name="servicios"]:checked');

        if (seleccionados.length === 0) {
            return marcarError(grupos.servicios, "Selecciona al menos un servicio de interes.");
        }

        return marcarOk(grupos.servicios);
    }

    function validarTurno() {
        const seleccionado = document.querySelector('input[name="turno-preferido"]:checked');

        if (!seleccionado) {
            return marcarError(grupos.turno, "Selecciona un turno preferido.");
        }

        return marcarOk(grupos.turno);
    }

    function validarFrecuenciaVisitas() {
        if (!campos.frecuenciaVisitas.value) {
            return marcarError(campos.frecuenciaVisitas, "Selecciona la frecuencia estimada de visitas.");
        }

        return marcarOk(campos.frecuenciaVisitas);
    }

    function validarObservaciones() {
        if (campos.observaciones.value.length > 300) {
            return marcarError(campos.observaciones, "Las observaciones no pueden superar los 300 caracteres.");
        }

        return marcarOk(campos.observaciones);
    }

    function validarAutorizaciones() {
        if (!campos.terminos.checked || !campos.privacidad.checked) {
            return marcarError(grupos.autorizaciones, "Debes aceptar Terminos y Condiciones y Politica de Privacidad.");
        }

        return marcarOk(grupos.autorizaciones);
    }

    function validarTextoMinimo(campo, minimo, mensaje) {
        if (obtenerValor(campo).length < minimo) {
            return marcarError(campo, mensaje);
        }

        return marcarOk(campo);
    }

    function obtenerValor(campo) {
        return campo.value.trim();
    }

    function calcularEdad(fecha) {
        const nacimiento = new Date(fecha + "T00:00:00");
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad;
    }

    function marcarError(elemento, mensaje) {
        const contenedor = obtenerContenedorMensaje(elemento);

        elemento.classList.add("campo-error");
        elemento.classList.remove("campo-ok");
        quitarMensaje(contenedor);

        const mensajeError = document.createElement("small");
        mensajeError.className = "mensaje-error";
        mensajeError.textContent = mensaje;
        contenedor.appendChild(mensajeError);

        return { valido: false, elemento: elemento };
    }

    function marcarOk(elemento) {
        const contenedor = obtenerContenedorMensaje(elemento);

        elemento.classList.add("campo-ok");
        elemento.classList.remove("campo-error");
        quitarMensaje(contenedor);

        return { valido: true, elemento: elemento };
    }

    function limpiarEstado(elemento) {
        const contenedor = obtenerContenedorMensaje(elemento);

        elemento.classList.remove("campo-error", "campo-ok");
        quitarMensaje(contenedor);
    }

    function limpiarEstados() {
        formulario.querySelectorAll(".campo-error, .campo-ok").forEach(function (elemento) {
            elemento.classList.remove("campo-error", "campo-ok");
        });

        formulario.querySelectorAll(".mensaje-error").forEach(function (mensaje) {
            mensaje.remove();
        });
    }

    function obtenerContenedorMensaje(elemento) {
        return elemento.closest(".campo") || elemento.closest(".grupo-opciones") || elemento.parentElement;
    }

    function quitarMensaje(contenedor) {
        const mensajeAnterior = contenedor.querySelector(".mensaje-error");

        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
    }

    function mostrarResumenErrores(cantidadErrores) {
        const resumen = document.getElementById("resumen-errores");
        resumen.textContent = "Se encontraron " + cantidadErrores + " error(es). Revisa los campos marcados antes de continuar.";
        resumen.style.display = "block";
    }

    function limpiarResumenErrores() {
        const resumen = document.getElementById("resumen-errores");
        resumen.textContent = "";
        resumen.style.display = "none";
    }

    function mostrarConfirmacion() {
        const serviciosSeleccionados = Array.from(document.querySelectorAll('input[name="servicios"]:checked')).map(function (servicio) {
            return servicio.parentElement.textContent.trim();
        });

        const numeroRegistro = "VC-" + Math.floor(100000 + Math.random() * 900000);
        const confirmacion = document.createElement("section");
        confirmacion.className = "pantalla-confirmacion";
        confirmacion.innerHTML = `
            <span>Registro exitoso</span>
            <h2>Cuenta creada correctamente</h2>
            <p><strong>Dueño:</strong> ${escaparHtml(obtenerValor(campos.nombreDuenio))}</p>
            <p><strong>Mascota:</strong> ${escaparHtml(obtenerValor(campos.nombreMascota))}</p>
            <p><strong>Numero de registro:</strong> ${numeroRegistro}</p>
            <p><strong>Servicios seleccionados:</strong> ${escaparHtml(serviciosSeleccionados.join(", "))}</p>
            <div class="acciones-formulario">
                <a href="index.html" class="boton boton-enlace">Volver al inicio</a>
                <button type="button" class="boton boton-principal" id="registrar-otra-mascota">Registrar otra mascota</button>
            </div>
        `;

        formulario.style.display = "none";
        presentacion.after(confirmacion);
        confirmacion.scrollIntoView({ behavior: "smooth", block: "start" });

        document.getElementById("registrar-otra-mascota").addEventListener("click", function () {
            formulario.reset();
            limpiarEstados();
            limpiarResumenErrores();
            prepararCamposDinamicos();
            actualizarContador(campos.condicionesMedicas, 250);
            actualizarContador(campos.observaciones, 300);
            confirmacion.remove();
            formulario.style.display = "flex";
            presentacion.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function escaparHtml(texto) {
        return texto
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});
