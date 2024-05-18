// Función para obtener los datos del localStorage o devolver un array vacío si no hay datos
function obtenerDatos(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Función para guardar los datos en el localStorage
function guardarDatos(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Función para inicializar los datos si no existen en el localStorage
function inicializarDatos() {
  if (!localStorage.getItem('equipos')) {
    const equipos = [];
    guardarDatos('equipos', equipos);
  }

  if (!localStorage.getItem('partidos')) {
    const partidos = [];
    guardarDatos('partidos', partidos);
  }
}

// Función para calcular la tabla de posiciones
function calcularTablaPosiciones() {
  const equipos = obtenerDatos('equipos');
  const partidos = obtenerDatos('partidos');

  // Reiniciar estadísticas de los equipos
  equipos.forEach(equipo => {
    equipo.PJ = 0;
    equipo.PG = 0;
    equipo.PE = 0;
    equipo.PP = 0;
    equipo.GF = 0;
    equipo.GC = 0;
    equipo.GD = 0;
    equipo.Pts = 0;
  });

  // Calcular estadísticas de los partidos
  partidos.forEach(partido => {
    const equipoLocal = equipos.find((equipo, index) => index === partido.equipoLocalIndex);
    const equipoVisitante = equipos.find((equipo, index) => index === partido.equipoVisitanteIndex);

    if (equipoLocal && equipoVisitante) {
      equipoLocal.PJ++;
      equipoVisitante.PJ++;

      equipoLocal.GF += partido.golesLocal;
      equipoVisitante.GF += partido.golesVisitante;

      equipoLocal.GC += partido.golesVisitante;
      equipoVisitante.GC += partido.golesLocal;

      if (partido.golesLocal > partido.golesVisitante) {
        // Equipo local gana
        equipoLocal.PG++;
        equipoLocal.Pts += 3;
        equipoVisitante.PP++;
      } else if (partido.golesLocal < partido.golesVisitante) {
        // Equipo visitante gana
        equipoVisitante.PG++;
        equipoVisitante.Pts += 3;
        equipoLocal.PP++;
      } else {
        // Empate
        equipoLocal.PE++;
        equipoLocal.Pts++;
        equipoVisitante.PE++;
        equipoVisitante.Pts++;
      }

      // Calcular diferencia de goles
      equipoLocal.GD = equipoLocal.GF - equipoLocal.GC;
      equipoVisitante.GD = equipoVisitante.GF - equipoVisitante.GC;
    }
  });

  // Ordenar equipos por puntos, diferencia de goles y goles a favor
  equipos.sort((a, b) => {
    if (a.Pts !== b.Pts) return b.Pts - a.Pts;
    if (a.GD !== b.GD) return b.GD - a.GD;
    return b.GF - a.GF;
  });

  // Actualizar datos en localStorage
  guardarDatos('equipos', equipos);
}

// Función para mostrar la tabla de posiciones en el HTML
function mostrarTablaPosiciones() {
  const tablaBody = document.querySelector('#tablaPosiciones tbody');
  tablaBody.innerHTML = '';

  const equipos = obtenerDatos('equipos');
  const filtroEquipo = document.getElementById('filterEquipo').value.toLowerCase();
  const filtroPosicion = parseInt(document.getElementById('filterPosicion').value);

  equipos.forEach((equipo, index) => {
    if ((filtroEquipo === 'todos' || index === Number(filtroEquipo)) &&
      (isNaN(filtroPosicion) || index + 1 === filtroPosicion)) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${equipo.nombre}</td>
        <td>${equipo.PJ}</td>
        <td>${equipo.PG}</td>
        <td>${equipo.PE}</td>
        <td>${equipo.PP}</td>
        <td>${equipo.GF}</td>
        <td>${equipo.GC}</td>
        <td>${equipo.GD}</td>
        <td>${equipo.Pts}</td>
      `;
      tablaBody.appendChild(row);
    }
  });
}

// Función para manejar el envío del formulario de equipos
document.getElementById('teamForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const equipo = document.getElementById('equipo').value.trim().toLowerCase();
  const equipos = obtenerDatos('equipos');

  // Verificar si el equipo ya está registrado
  if (equipos.some(e => e.nombre.toLowerCase() === equipo)) {
    alert('El equipo ya está registrado');
    return;
  }

  // Verificar si se supera el límite de equipos
  if (equipos.length >= 5) {
    alert('Se ha alcanzado el límite de equipos (5)');
    return;
  }

  // Registrar nuevo equipo
  equipos.push({ nombre: equipo, PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, GD: 0, Pts: 0 });
  guardarDatos('equipos', equipos);

  // Actualizar y mostrar tabla de posiciones
  calcularTablaPosiciones();
  mostrarTablaPosiciones();

  // Limpiar el formulario después del registro
  this.reset();

  // Actualizar listas desplegables de equipos en el formulario de resultados
  cargarEquiposSelect();
});

// Event listener para el cambio de valor en el filtro de equipo
document.getElementById('filterEquipo').addEventListener('change', function() {
  mostrarTablaPosiciones();
});

// Event listener para el cambio de valor en el filtro de posición
document.getElementById('filterPosicion').addEventListener('change', function() {
  mostrarTablaPosiciones();
});

// Función para manejar el envío del formulario de resultados
document.getElementById('resultForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const equipoLocalIndex = parseInt(document.getElementById('equipoLocal').value);
  const equipoVisitanteIndex = parseInt(document.getElementById('equipoVisitante').value);
  const golesLocal = parseInt(document.getElementById('golesLocal').value);
  const golesVisitante = parseInt(document.getElementById('golesVisitante').value);

  // Obtener equipos y partidos
  const equipos = obtenerDatos('equipos');
  const partidos = obtenerDatos('partidos');

  // Verificar que el equipo local no sea el mismo que el visitante
  if (equipoLocalIndex === equipoVisitanteIndex) {
    alert('El equipo local no puede ser el mismo que el equipo visitante');
    return;
  }

  // Verificar que los equipos no hayan jugado antes
  const partidoDuplicado = partidos.some(partido =>
    (partido.equipoLocalIndex === equipoLocalIndex && partido.equipoVisitanteIndex === equipoVisitanteIndex) ||
    (partido.equipoLocalIndex === equipoVisitanteIndex && partido.equipoVisitanteIndex === equipoLocalIndex)
  );
  if (partidoDuplicado) {
    alert('Ya se ha registrado un partido entre estos equipos');
    return;
  }

  // Registrar el partido
  partidos.push({ equipoLocalIndex, equipoVisitanteIndex, golesLocal, golesVisitante });
  guardarDatos('partidos', partidos);

  // Actualizar y mostrar tabla de posiciones
  calcularTablaPosiciones();
  mostrarTablaPosiciones();

  // Limpiar el formulario después del registro
  this.reset();
});

// Función para cargar los equipos en los select del formulario de resultados
function cargarEquiposSelect() {
  const equipos = obtenerDatos('equipos');
  const selectLocal = document.getElementById('equipoLocal');
  const selectVisitante = document.getElementById('equipoVisitante');
  const selectFilter = document.getElementById('filterEquipo');
  const todos =document.createElement('option');
  todos.text="Todos"

  // Limpiar listas desplegables
  selectLocal.innerHTML = '';
  selectVisitante.innerHTML = '';
  selectFilter.innerHTML = '';
  selectFilter.add(todos);

  equipos.forEach((equipo, index) => {
    const option = document.createElement('option');
    option.text = equipo.nombre;
    option.value = index;
    selectLocal.add(option);
  });

  equipos.forEach((equipo, index) => {
    const option = document.createElement('option');
    option.text = equipo.nombre;
    option.value = index;
    selectVisitante.add(option);
  });
  equipos.forEach((equipo, index) => {
    const option = document.createElement('option');
    option.text = equipo.nombre;
    option.value = index;
    selectFilter.add(option);
  });
}

// Llamar a la función para inicializar los datos
inicializarDatos();

// Llamar a la función para cargar los equipos en los select
cargarEquiposSelect();

// Llamar a la función para mostrar la tabla de posiciones inicial
mostrarTablaPosiciones();
