// =======================================================
// === 1. DEFINICIÓN DE LAS FUNCIONES DE LOS PROBLEMAS ===
// =======================================================

const PROBLEMAS = {
    // PROBLEMA 1: x^3 - e^(0.8x) - 20 = 0
    p1: {
        f: (x) => x**3 - Math.exp(0.8 * x) - 20,
        df: (x) => 3 * x**2 - 0.8 * Math.exp(0.8 * x)
    },
    // PROBLEMA 2: 3sen(0.5x) - 0.5x + 2 = 0
    p2: {
        f: (x) => 3 * Math.sin(0.5 * x) - 0.5 * x + 2,
        df: (x) => 1.5 * Math.cos(0.5 * x) - 0.5
    },
    // PROBLEMA 3: x^3 - x^2*exp(-0.5x) - 3x + 1 = 0
    p3: {
        f: (x) => x**3 - (x**2) * Math.exp(-0.5 * x) - 3 * x + 1,
        df: (x) => {
            const exp_term = Math.exp(-0.5 * x);
            return 3 * x**2 - 3 - 2 * x * exp_term + 0.5 * (x**2) * exp_term;
        }
    },
    // PROBLEMA 4: cos^2(x) - 0.5x*exp(0.3x) + 5 = 0
    p4: {
        f: (x) => Math.cos(x)**2 - 0.5 * x * Math.exp(0.3 * x) + 5,
        df: (x) => {
            const exp_term = Math.exp(0.3 * x);
            const sin_term = -Math.sin(2 * x);
            const exp_deriv_term = -0.5 * exp_term - 0.15 * x * exp_term;
            return sin_term + exp_deriv_term;
        }
    }
};

// ===============================================
// === 2. IMPLEMENTACIÓN DE MÉTODOS NUMÉRICOS ===
// ===============================================

const MAX_ITER = 100;

function biseccion(f, a, b, tol_percent) {
    const table = [];
    if (f(a) * f(b) >= 0) {
        return { root: NaN, table, error: "El intervalo no garantiza cambio de signo (f(a)f(b) >= 0)." };
    }

    let c = 0, c_prev = 0;
    
    for (let k = 1; k <= MAX_ITER; k++) {
        c = (a + b) / 2;
        const fc = f(c);
        
        let error_relativo = NaN;
        if (k > 1 && c !== 0) {
            error_relativo = Math.abs((c - c_prev) / c) * 100;
            if (error_relativo < tol_percent) {
                table.push({ k, a, b, c, fc, error_relativo });
                break;
            }
        }
        
        table.push({ k, a, b, c, fc, error_relativo });
        
        if (f(a) * fc < 0) {
            b = c;
        } else {
            a = c;
        }
        
        c_prev = c;
        if (k === MAX_ITER) return { root: c, table, error: "Máximo de iteraciones alcanzado." };
    }
    return { root: c, table };
}

function newtonRaphson(f, df, x0, tol_percent) {
    const table = [];
    let xk = x0;

    for (let k = 1; k <= MAX_ITER; k++) {
        const fxk = f(xk);
        const dfxk = df(xk);

        if (Math.abs(dfxk) < 1e-10) {
            return { root: NaN, table, error: "Derivada muy cercana a cero. Falla del método." };
        }
            
        const x_new = xk - fxk / dfxk;
        
        let error_relativo = NaN;
        if (k > 1 && x_new !== 0) {
            error_relativo = Math.abs((x_new - xk) / x_new) * 100;
            if (error_relativo < tol_percent) {
                table.push({ k, xk, fxk, dfxk, x_new, error_relativo });
                return { root: x_new, table };
            }
        }
        
        table.push({ k, xk, fxk, dfxk, x_new, error_relativo });
        xk = x_new;
        
        if (k === MAX_ITER) return { root: xk, table, error: "Máximo de iteraciones alcanzado." };
    }
    return { root: xk, table };
}

function secante(f, x_prev, x_curr, tol_percent) {
    const table = [];

    for (let k = 1; k <= MAX_ITER; k++) {
        const f_prev = f(x_prev);
        const f_curr = f(x_curr);
        
        if (Math.abs(f_curr - f_prev) < 1e-10) {
            return { root: NaN, table, error: "Denominador muy cercano a cero. Falla del método." };
        }
            
        const x_new = x_curr - f_curr * (x_curr - x_prev) / (f_curr - f_prev);
        
        let error_relativo = NaN;
        if (k > 1 && x_new !== 0) {
            error_relativo = Math.abs((x_new - x_curr) / x_new) * 100;
            if (error_relativo < tol_percent) {
                table.push({ k, x_prev, x_curr, f_prev, f_curr, x_new, error_relativo });
                return { root: x_new, table };
            }
        }
        
        table.push({ k, x_prev, x_curr, f_prev, f_curr, x_new, error_relativo });
        
        x_prev = x_curr;
        x_curr = x_new;

        if (k === MAX_ITER) return { root: x_curr, table, error: "Máximo de iteraciones alcanzado." };
    }
    return { root: x_curr, table };
}


// ===============================================
// === 3. LÓGICA DE INTERFAZ Y EJECUCIÓN ===
// ===============================================

/**
 * Genera dinámicamente los inputs requeridos según el método seleccionado.
 */
function actualizarInputs() {
    const metodo = document.getElementById('metodo').value;
    const inputsContainer = document.getElementById('inputs-metodo');
    const problemaSelect = document.getElementById('problema');
    const selectedOption = problemaSelect.options[problemaSelect.selectedIndex];
    
    const intervaloString = selectedOption.getAttribute('data-intervalo');
    const match = intervaloString.match(/\[(.*),(.*)\]/);
    let a_sug = '1', b_sug = '2';
    
    if (match && match.length === 3) {
        a_sug = match[1].trim();
        b_sug = match[2].trim();
    } 

    let htmlContent = '';

    if (metodo === 'biseccion') {
        htmlContent = `
            <div class="mb-3">
                <label for="a_val" class="form-label custom-label-futurista">Extremo Inferior (a):</label>
                <input type="number" id="a_val" class="form-control custom-input-futurista" value="${a_sug}" step="any" required>
            </div>
            <div class="mb-3">
                <label for="b_val" class="form-label custom-label-futurista">Extremo Superior (b):</label>
                <input type="number" id="b_val" class="form-control custom-input-futurista" value="${b_sug}" step="any" required>
            </div>
            <p class="nota">Rango Sugerido: ${intervaloString}</p>
        `;
    } else if (metodo === 'newton') {
        const x0_sug = ((parseFloat(a_sug) + parseFloat(b_sug)) / 2).toFixed(4);
        htmlContent = `
            <div class="mb-3">
                <label for="x0_val" class="form-label custom-label-futurista">Aproximación Inicial ($x_0$):</label>
                <input type="number" id="x0_val" class="form-control custom-input-futurista" value="${x0_sug}" step="any" required>
            </div>
            <p class="nota">Valor Sugerido: ${x0_sug} (cerca de ${intervaloString})</p>
        `;
    } else if (metodo === 'secante') {
        htmlContent = `
            <div class="mb-3">
                <label for="xp_val" class="form-label custom-label-futurista">Aprox. $x_{k-1}$:</label>
                <input type="number" id="xp_val" class="form-control custom-input-futurista" value="${a_sug}" step="any" required>
            </div>
            <div class="mb-3">
                <label for="xc_val" class="form-label custom-label-futurista">Aprox. $x_k$:</label>
                <input type="number" id="xc_val" class="form-control custom-input-futurista" value="${b_sug}" step="any" required>
            </div>
            <p class="nota">Valores Sugeridos: ${a_sug} y ${b_sug} (del rango ${intervaloString})</p>
        `;
    }

    inputsContainer.innerHTML = htmlContent;
}

/**
 * Actualiza la ecuación mostrada usando KaTeX al cambiar la selección.
 */
function actualizarEcuacion() {
    const problemaSelect = document.getElementById('problema');
    const selectedOption = problemaSelect.options[problemaSelect.selectedIndex];
    const formulaLatex = selectedOption.getAttribute('data-formula');
    
    const displayElement = document.getElementById('ecuacion-display');
    
    katex.render(`f(x) = ${formulaLatex}`, displayElement, {
        displayMode: true,
        throwOnError: false
    });
    
    actualizarInputs();
}

/**
 * Función principal para ejecutar el método seleccionado.
 */
function ejecutarMetodo() {
    actualizarInputs(); 
    
    const problemaId = document.getElementById('problema').value;
    const metodo = document.getElementById('metodo').value;
    const tolerancia = parseFloat(document.getElementById('tolerancia').value);
    const raizElement = document.getElementById('resultado-raiz');

    if (isNaN(tolerancia) || tolerancia <= 0) {
        raizElement.className = 'custom-alert-info-futurista custom-alert-error-futurista';
        raizElement.innerHTML = `[ERROR 001] Falla en Validación: **Tolerancia Invalida** (< 0 o No Numérica).`;
        document.getElementById('tabla-resultados-container').innerHTML = '';
        return;
    }

    const { f, df } = PROBLEMAS[problemaId];
    let resultado = { root: NaN, table: [], error: 'Método no implementado.' };

    try {
        if (metodo === 'biseccion') {
            const a = parseFloat(document.getElementById('a_val').value);
            const b = parseFloat(document.getElementById('b_val').value);
            resultado = biseccion(f, a, b, tolerancia);

        } else if (metodo === 'newton') {
            const x0 = parseFloat(document.getElementById('x0_val').value);
            resultado = newtonRaphson(f, df, x0, tolerancia);

        } else if (metodo === 'secante') {
            const xp = parseFloat(document.getElementById('xp_val').value);
            const xc = parseFloat(document.getElementById('xc_val').value);
            resultado = secante(f, xp, xc, tolerancia);
        }

        mostrarResultados(resultado, metodo);

    } catch (e) {
        raizElement.className = 'custom-alert-info-futurista custom-alert-error-futurista';
        raizElement.innerHTML = `[ERROR 002] Excepción de Software: **${e.message}**`;
        document.getElementById('tabla-resultados-container').innerHTML = '';
    }
}


/**
 * Muestra el resultado de la raíz y la tabla de iteraciones.
 */
function mostrarResultados(resultado, metodo) {
    const raizElement = document.getElementById('resultado-raiz');
    const tablaContainer = document.getElementById('tabla-resultados-container');

    if (resultado.error) {
        // Usa la clase de error para el nuevo estilo
        raizElement.className = 'custom-alert-info-futurista custom-alert-error-futurista';
        raizElement.innerHTML = `[ERROR 404] Condición de Parada: **${resultado.error}**`;
        tablaContainer.innerHTML = '';
        return;
    }
    
    // Usa la clase de éxito para el nuevo estilo
    raizElement.className = 'custom-alert-info-futurista custom-alert-success'; 

    const raizFormateada = resultado.root.toFixed(8); 
    raizElement.innerHTML = `[STATUS OK] Raíz Encontrada: **${raizFormateada}** (Iteraciones: ${resultado.table.length})`;
    
    if (resultado.table.length === 0) {
        tablaContainer.innerHTML = '<p class="text-secondary text-center">Datos Insuficientes para Generar Historial.</p>';
        return;
    }

    let headers;
    if (metodo === 'biseccion') {
        headers = ['k', 'a', 'b', 'c_k', 'f(c_k)', 'Error Relativo (%)'];
    } else if (metodo === 'newton') {
        headers = ['k', 'x_k', 'f(x_k)', "f'(x_k)", 'x_{k+1}', 'Error Relativo (%)'];
    } else if (metodo === 'secante') {
        headers = ['k', 'x_{k-1}', 'x_k', 'f(x_{k-1})', 'f(x_k)', 'x_{k+1}', 'Error Relativo (%)'];
    }

    let htmlTable = '<table class="table table-striped" id="tabla-resultados"><thead><tr>';
    headers.forEach(h => htmlTable += `<th>${h}</th>`);
    htmlTable += '</tr></thead><tbody>';

    resultado.table.forEach(row => {
        htmlTable += '<tr>';
        Object.values(row).forEach(val => {
            const formattedVal = (typeof val === 'number' && val !== row.k && !isNaN(val)) ? val.toFixed(8) : (val === row.k ? val : 'N/A');
            htmlTable += `<td>${formattedVal}</td>`;
        });
        htmlTable += '</tr>';
    });
    
    htmlTable += '</tbody></table>';
    tablaContainer.innerHTML = htmlTable;
}

// Inicialización de la página al cargar
document.addEventListener('DOMContentLoaded', () => {
    actualizarEcuacion();
});
