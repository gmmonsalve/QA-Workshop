// Import the functions from script.js    
const formHTML = require('../index.html')
const datosTabla = [
      {
          "nombre": "junior",
          "PJ": 1,
          "PG": 1,
          "PE": 0,
          "PP": 0,
          "GF": 4,
          "GC": 2,
          "GD": 2,
          "Pts": 3
      },
      {
          "nombre": "medellin",
          "PJ": 0,
          "PG": 0,
          "PE": 0,
          "PP": 0,
          "GF": 0,
          "GC": 0,
          "GD": 0,
          "Pts": 0
      },
      {
          "nombre": "santafe",
          "PJ": 1,
          "PG": 0,
          "PE": 0,
          "PP": 1,
          "GF": 2,
          "GC": 4,
          "GD": -2,
          "Pts": 0
      }
  ]

beforeEach(() => {
      document.body.innerHTML = formHTML
});
    
describe('Test for script.js', () => {

      test('When script inits it should initialize values at localStorage',()=>{
            const script = require('../js/script.js')
            script.inicializarDatos()
            expect(localStorage.length).toBe(2)
      })

      test('When script inits it should load available football teams into selects',()=>{
            const script = require('../js/script.js')
            const selectLocal = document.getElementById('equipoLocal');
            const selectVisitante = document.getElementById('equipoVisitante');
            const selectFilter = document.getElementById('filterEquipo');
            localStorage.setItem('equipos', JSON.stringify(datosTabla))

            script.cargarEquiposSelect()
            expect(selectLocal.childElementCount).toBe(3)
            expect(selectVisitante.childElementCount).toBe(3)
            expect(selectFilter.childElementCount).toBe(4)
      })

      test('Calcular tabla de posiciones should', () => {
            const script = require('../js/script.js')
           
            localStorage.setItem('equipos', JSON.stringify(datosTabla))
            const spy = jest.spyOn(script, 'calcularTablaPosiciones')
            script.calcularTablaPosiciones()
            expect(spy).toHaveBeenCalled()
      });
      
});