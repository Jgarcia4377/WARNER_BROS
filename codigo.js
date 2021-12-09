
AbrevDia = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
AbrevDiaFs = ['SA', 'SU']
hora_minima = 0
hora_maima = 24
fin=0;

let turno_manana = [nombre = 'turno_manana', horas = '00:01-09:00'];
let turno_tarde = [nombre = 'turno_tarde', horas = '09:01-18:00'];
let turno_noche = [nombre = 'turno_noche', horas = '18:01-00:00'];

let turnos = [turno_manana, turno_tarde, turno_noche];

base = {
  'turno_manana': {
    'semana_laboral': 25,
    'fin_semana': 30
  },
  'turno_tarde': {
    'semana_laboral': 15,
    'fin_semana': 20
  },
  'turno_noche': {
    'semana_laboral': 20,
    'fin_semana': 25
  }
}


document.getElementById('file').onchange = function () {
  let empleados = [];
  var file = this.files[0];
  var reader = new FileReader();
  reader.onload = function (progressEvent) {
    console.log( this.result.split(/\r\n|\n/));
    var contenidoFileArray = this.result.split(/\r\n|\n/);
    for (var linea = 0; linea < contenidoFileArray.length; linea++) {
      let nombre = get_nombre_empleado(contenidoFileArray[linea]);
      let semana = get_semana_trabajada(contenidoFileArray[linea]);
      let empleado = new Empleado(nombre, semana);
      empleados.push(empleado);
    }
    for (let i = 0; i < empleados.length; i++) {
      console.log("El monto a pagar " + empleados[i].nombre + " es: " + empleados[i].semana_trabajada + " USD"); 
      
    }
  };
  reader.readAsText(file);
};



function get_nombre_empleado(nombre) {
  nombre_empleado = nombre.split('=')[0];
  return nombre_empleado
}


function get_semana_trabajada(semana) {
  semana_trabajada = semana.split('=')[1];
  return semana_trabajada

}


class Empleado {
  constructor(nombre, semana_trabajada) {
    this.nombre = nombre;
    this.semana_trabajada = this.salario(semana_trabajada);
  }

  salario(semana_trabajada) {
    let salario = 0;
    let fechasYhoras = semana_trabajada.split(',');
    for (var i = 0; i < fechasYhoras.length; i++) {
      let dias_trabajados = get_horasAlDia(fechasYhoras[i]);
      let dia_abrev = get_Dia_abrev(fechasYhoras[i]);
      let dia = new Dia(dia_abrev);
      salario+= dia.get_costo_dia(dias_trabajados);
      // salario++
    }
    return salario;
  }
}


class Dia {
  constructor(dia_abrev) {
    this.dia_abrev = dia_abrev;
    this.semana = this.get_semana(dia_abrev);
  }

  get_semana(dia_abrev) {
    let semana = 'semana_laboral';
    if (AbrevDiaFs.includes(dia_abrev)) {
      semana = "fin_semana"
    }
    return semana;
  }

  get_costo_dia(horas) {
    let minuto = 1/60;
    let horas_laboradas = new HorasLaborables(horas);
    let costo = 0;
    let horas_trabajadas;
    let flag = false;
    for (let turno = 0; turno < turnos.length; turno++) {
      let indice = base[turnos[turno][0]][this.semana]
      if (horas_laboradas.get_hora_inicio(turnos[turno])) {
        if (horas_laboradas.hora_fin <= fin) {
          horas_trabajadas = horas_laboradas.hora_fin - horas_laboradas.hora_inicio;
          costo+= (horas_trabajadas * indice);
          // costo++
          if (flag) {
            costo+= minuto * indice;
            // costo++
            flag = false;
          }
        }else{
          horas_trabajadas = fin - horas_laboradas.hora_inicio;
          costo+=horas_trabajadas * indice;
          // costo++
          if (flag) {
            costo+=minuto * indice;
            // costo++
            flag = false;
          }
          horas_laboradas.hora_inicio = fin + minuto;
          flag = true;
        }
      }
    }
    return costo;
  }
}




class HorasLaborables {
  constructor(horas) {
    this.hora_inicio = this.get_horas_minutos_inicio(horas);
    this.hora_fin = this.get_horas_minutos_fin(horas);
    this.hora_inicio = this.get_horas(this.hora_inicio);
    this.hora_fin = this.get_horas(this.hora_fin);
    this.hora_fin = this.consultar_hora_fin(this.hora_fin);
  }

  get_horas_minutos_inicio(horas) {
    let hora_inicio = horas.substr(0, 5);
    return hora_inicio;
  }

  get_horas_minutos_fin(horas) {
    let hora_fin = horas.substr(6);
    return hora_fin;
  }

  get_horas(horas) {
    let hora = formato_hora(horas);
    return hora;
  }

  consultar_hora_fin(hora_finn) {
    let hora_fin = hora_finn;
    if (hora_finn == 0) {
      hora_fin = 24;
    }
    return hora_fin;
  }

  get_hora_inicio(turno){
    let flag = false;
    let hora = turno[1];
    let hora_inicio = this.get_horas_minutos_inicio(hora);
    let hora_fin = this.get_horas_minutos_fin(hora);
    hora_inicio = this.get_horas(hora_inicio);
    hora_fin = this.get_horas(hora_fin);
    hora_fin = this.consultar_hora_fin(hora_fin);
    fin = hora_fin;
    if (this.hora_inicio >= hora_inicio) {
      if (this.hora_inicio <= hora_fin) {
        flag = true;
      }
    }
    return flag;
  }

}


function get_horasAlDia(dia_trabajado) {
  tiempo_trabajado = dia_trabajado.substr(2);
  return tiempo_trabajado;
}

function get_Dia_abrev(dia) {
  let dia_abre = dia.substr(0, 2);
  return dia_abre;
}

function formato_hora(hora) {
  let h = hora.substr(0, 2);
  let m = hora.substr(3);
  let horas = parseInt(h) + parseInt(m) / 60;
  return horas;
}
