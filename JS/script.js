// ---- Constantes y datos ----
const ESTANDAR_CALI = 14;   // mm
const AJUSTE = 0.053;       // 5.3% entre 3pm y 6pm
let registros = [];         // arreglo donde guardo cada registro

const $ = id => document.getElementById(id);

// ---- Login ----
function entrar() {
  if ($('user').value === 'CVC' && $('pass').value === 'Lluvias') {
    $('login').classList.add('oculto');
    $('panel').classList.remove('oculto');
    $('errLogin').innerHTML = '';
  } else {
    $('errLogin').innerHTML = 'Usuario o contraseña incorrectos';
  }
}

function cerrarSesion() {
  $('panel').classList.add('oculto');
  $('login').classList.remove('oculto');
  $('user').value = '';
  $('pass').value = '';
}

// "HH:MM" -> horas en decimal
function aHoras(t) {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

// ---- Registro ----
function registrar() {
  const dir = $('direccion').value.trim();
  const ini = $('inicio').value;
  const fin = $('fin').value;
  const mm = parseFloat($('mm').value);
  const quien = $('quien').value.trim();

  if (!dir || !ini || !fin || isNaN(mm) || mm < 0 || !quien) {
    alert('Completa todos los campos (los mm no pueden ser negativos)');
    return;
  }

  // tiempo total en horas (si pasa de medianoche le sumo 24)
  let horas = aHoras(fin) - aHoras(ini);
  if (horas <= 0) horas += 24;

  // ajuste del 5.3% si inicia entre 3pm y 6pm
  const hIni = aHoras(ini);
  let valor = mm;
  let nota = '';
  if (hIni >= 15 && hIni <= 18) {
    valor = mm * (1 + AJUSTE);
    nota = ' (con ajuste de 5.3% por horario de alta nubosidad)';
  }

  // efecto reloj: dura precipitación * estándar * tiempo total (en ms, entre 1 y 5 s)
  const espera = Math.min(Math.max(valor * ESTANDAR_CALI * horas, 1000), 5000);

  $('btnReg').disabled = true;
  $('resultado').innerHTML = '';
  $('reloj').classList.remove('oculto');

  setTimeout(() => {
    $('reloj').classList.add('oculto');
    $('btnReg').disabled = false;

    const dif = valor - ESTANDAR_CALI;
    let msg;
    if (dif > 0) msg = `<span class="sube">Supera el estándar por ${dif.toFixed(2)} mm</span>`;
    else if (dif < 0) msg = `<span class="baja">Está ${Math.abs(dif).toFixed(2)} mm por debajo del estándar</span>`;
    else msg = 'Igual al estándar de Cali';

    $('resultado').innerHTML =
      `Zona: ${dir}<br>Duración: ${horas.toFixed(2)} h<br>` +
      `Precipitación: ${valor.toFixed(2)} mm${nota}<br>${msg}<br>Registrado por: ${quien}`;

    registros.push({ dir, valor, quien });
    dibujarGrafica();

    // dejo que el navegador pinte antes de abrir el prompt
    setTimeout(pedirClave, 300);
  }, espera);
}

// ---- Clave de seguridad ----
function pedirClave() {
  const clave = prompt("Escribe la palabra clave 'CLIMA' para registrar otra zona");
  if (clave === 'CLIMA') {
    ['direccion', 'inicio', 'fin', 'mm', 'quien'].forEach(id => $(id).value = '');
  } else {
    alert('Clave incorrecta. Volviendo al login');
    cerrarSesion();
  }
}

// ---- Gráfica de barras ----
function dibujarGrafica() {
  const max = Math.max(ESTANDAR_CALI, ...registros.map(r => r.valor)) * 1.1;
  let html = `<div class="linea" style="bottom:${ESTANDAR_CALI / max * 100}%"></div>`;
  registros.forEach((r, i) => {
    const alto = r.valor / max * 100;
    const clase = r.valor > ESTANDAR_CALI ? 'barra alta' : 'barra';
    html += `<div class="${clase}" style="height:${alto}%" title="${r.dir}">${r.valor.toFixed(1)}<br>#${i + 1}</div>`;
  });
  $('grafica').innerHTML = html;
}

// ---- Foto ----
function verFoto(input) {
  if (input.files && input.files[0]) {
    $('vista').src = URL.createObjectURL(input.files[0]);
    $('vista').classList.remove('oculto');
  }
}
