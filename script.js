/* script.js - CatálogoFácil PRO mejorado */

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

let editIndex = null;

const $ = id => document.getElementById(id);

const contenedor = $("contenedorProductos");
const filtro = $("filtroCategoria");
const ordenSelect = $("orden");
const btnAgregar = $("btnAgregar");
const btnPDF = $("btnPDF");
const btnLimpiar = $("btnLimpiar");
const btnBackup = $("btnBackup");
const btnAddCategoria = $("btnAddCategoria");
const nuevaCategoriaInput = $("nuevaCategoria");

const modal = $("modal");
const modalTitulo = $("modalTitulo");
const nombre = $("nombre");
const precio = $("precio");
const categoriaSelect = $("categoria");
const imagen = $("imagen");
const preview = $("preview");
const destacado = $("destacado");
const oferta = $("oferta");
const btnGuardar = $("guardar");
const btnCancelar = $("cancelar");

const statTotal = $("statTotal");
const statOfertas = $("statOfertas");
const statDestacados = $("statDestacados");
const statCategorias = $("statCategorias");

/* DATOS NEGOCIO */

const inputNombreNegocio = $("nombreNegocio");
const inputLogoNegocio = $("logoNegocio");
const previewLogo = $("previewLogo");

/* ---------- UTILIDADES ---------- */

function saveState(){
  localStorage.setItem("productos",JSON.stringify(productos));
  localStorage.setItem("categorias",JSON.stringify(categorias));
}

function mostrarAlerta(msg){
  alert(msg);
}

/* ✅ VALIDACIÓN REAL */
function negocioConfigurado(){
  return inputNombreNegocio?.value.trim() !== "" && categorias.length > 0;
}

/* ---------- INICIO ---------- */

document.addEventListener("DOMContentLoaded",()=>{

  if(!Array.isArray(productos)) productos=[];
  if(!Array.isArray(categorias)) categorias=[];

  poblarFiltros();
  renderProductos(productos);
  actualizarStats();

  /* CARGAR DATOS NEGOCIO */

  const nombreGuardado = localStorage.getItem("nombreNegocio");
  const logoGuardado = localStorage.getItem("logoNegocio");

  if(inputNombreNegocio && nombreGuardado){
    inputNombreNegocio.value = nombreGuardado;
  }

  if(previewLogo && logoGuardado){
    previewLogo.src = logoGuardado;
  }

  actualizarBoton();

  /* GUARDAR NOMBRE */

  inputNombreNegocio?.addEventListener("input",()=>{
    localStorage.setItem("nombreNegocio",inputNombreNegocio.value);
    actualizarBoton();
  });

  inputNombreNegocio?.addEventListener("change",actualizarBoton);

  /* GUARDAR LOGO */

  inputLogoNegocio?.addEventListener("change",(e)=>{

    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = ev=>{
      localStorage.setItem("logoNegocio",ev.target.result);
      if(previewLogo){
        previewLogo.src = ev.target.result;
      }
    };

    reader.readAsDataURL(file);

  });

  /* EVENTOS */

  btnAgregar?.addEventListener("click",()=>{

    if(!negocioConfigurado()){
      return mostrarAlerta("Completá el nombre del negocio y al menos una categoría.");
    }

    abrirModal(null);

  });

  btnGuardar?.addEventListener("click",onGuardarClick);
  btnCancelar?.addEventListener("click",cerrarModal);

  imagen?.addEventListener("change",onImagenChange);

  modal?.addEventListener("click",e=>{
    if(e.target===modal) cerrarModal();
  });

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape") cerrarModal();
  });

  filtro?.addEventListener("change",()=>{
    renderProductos(obtenerListaFiltrada());
    actualizarStats();
  });

  ordenSelect?.addEventListener("change",()=>{
    renderProductos(obtenerListaFiltrada());
  });

  btnPDF?.addEventListener("click",generarPDF);

  btnLimpiar?.addEventListener("click",()=>{

    if(!confirm("¿Borrar todos los productos?")) return;

    productos=[];
    categorias=[];

    saveState();
    poblarFiltros();
    renderProductos(productos);
    actualizarStats();
    actualizarBoton();

  });

  btnBackup?.addEventListener("click",descargarBackup);

  /* 🔥 FIX CATEGORÍAS */

  btnAddCategoria?.addEventListener("click",()=>{

    const v = nuevaCategoriaInput.value.trim();

    if(!v) return mostrarAlerta("Escribe el nombre de la categoría");

    if(!categorias.includes(v)){
      categorias.push(v);
    }

    saveState();

    poblarFiltros(); // 🔥 clave
    poblarCategoriasEnModal();

    nuevaCategoriaInput.value="";
    actualizarStats();
    actualizarBoton();

  });

});

/* ---------- BOTÓN ---------- */

function actualizarBoton(){
  if(negocioConfigurado()){
    btnAgregar?.removeAttribute("disabled");
  }else{
    btnAgregar?.setAttribute("disabled",true);
  }
}

/* ---------- CATEGORIAS ---------- */

function poblarFiltros(){

  if(!filtro) return;

  filtro.innerHTML="";

  const base = [
    {value:"todas",text:"Todas las categorías"},
    {value:"destacados",text:"Destacados"},
    {value:"ofertas",text:"Ofertas"}
  ];

  base.forEach(o=>{
    const opt=document.createElement("option");
    opt.value=o.value;
    opt.textContent=o.text;
    filtro.appendChild(opt);
  });

  categorias.forEach(cat=>{
    const opt=document.createElement("option");
    opt.value=cat;
    opt.textContent=cat;
    filtro.appendChild(opt);
  });

  poblarCategoriasEnModal();
}

function poblarCategoriasEnModal(){

  if(!categoriaSelect) return;

  categoriaSelect.innerHTML="";

  categorias.forEach(cat=>{
    const opt=document.createElement("option");
    opt.value=cat;
    opt.textContent=cat;
    categoriaSelect.appendChild(opt);
  });

}

/* ---------- MODAL ---------- */

function abrirModal(prod=null){

  editIndex=null;

  modalTitulo.textContent=prod?"Editar producto":"Agregar producto";

  if(prod){

    nombre.value=prod.nombre;
    precio.value=prod.precio;
    categoriaSelect.value=prod.categoria||"";

    preview.src=prod.imagen||"";
    preview.style.display=prod.imagen?"block":"none";

    destacado.checked=prod.destacado;
    oferta.checked=prod.oferta;

    editIndex=productos.findIndex(p=>p===prod);

  }else{

    limpiarModalFields();
    poblarCategoriasEnModal();

  }

  modal.classList.remove("oculto");
  document.body.style.overflow="hidden";

}

function cerrarModal(){

  modal.classList.add("oculto");
  document.body.style.overflow="auto";

  limpiarModalFields();

  editIndex=null;

}

function limpiarModalFields(){

  nombre.value="";
  precio.value="";

  if(categoriaSelect){
    categoriaSelect.selectedIndex=0;
  }

  imagen.value="";
  preview.src="";
  preview.style.display="none";

  destacado.checked=false;
  oferta.checked=false;

}

/* ---------- IMAGEN ---------- */

function onImagenChange(e){

  const file=e.target.files[0];
  if(!file) return;

  const reader=new FileReader();

  reader.onload=ev=>{
    preview.src=ev.target.result;
    preview.style.display="block";
  };

  reader.readAsDataURL(file);

}

/* ---------- GUARDAR ---------- */

function onGuardarClick(){

  if(!nombre.value.trim()) return mostrarAlerta("Completá el nombre");
  if(!precio.value.trim()) return mostrarAlerta("Completá el precio");
  if(!preview.src) return mostrarAlerta("Subí una imagen");

  const nuevo = {
    nombre:nombre.value.trim(),
    precio:Number(precio.value),
    categoria:categoriaSelect.value,
    imagen:preview.src,
    destacado:destacado.checked,
    oferta:oferta.checked,
    id:Date.now()
  };

  if(editIndex!==null){
    productos[editIndex]=nuevo;
  }else{
    productos.push(nuevo);
  }

  saveState();

  renderProductos(obtenerListaFiltrada());
  actualizarStats();

  cerrarModal();

}

/* ---------- RENDER ---------- */

function renderProductos(list = productos){

  contenedor.innerHTML = "";

  if(list.length === 0){
    contenedor.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <h2>📦 No hay productos</h2>
        <p>Agregá productos para crear tu catálogo</p>
      </div>
    `;
    return;
  }

  list.forEach((p,i)=>{

    const div = document.createElement("div");

    div.className = "producto";

    if(p.destacado) div.classList.add("destacado");
    if(p.oferta) div.classList.add("oferta");

    const badges =
    (p.destacado ? `<div class="badge destacado">⭐ Destacado</div>` : "") +
    (p.oferta ? `<div class="badge oferta">🔥 Oferta</div>` : "");

    div.innerHTML = `
    ${badges}
    <img src="${p.imagen}">
    <h3>${p.nombre}</h3>
    <p>${p.categoria || ""}</p>
    <p><b>$${p.precio}</b></p>
    <div class="acciones no-imprimir">
    <button onclick="onEditar(${i})">✏️</button>
    <button onclick="onEliminar(${i})">🗑️</button>
    </div>
    `;

    contenedor.appendChild(div);

  });

}

/* ---------- RESTO IGUAL ---------- */

window.onEditar=i=>{
  editIndex=i;
  abrirModal(productos[i]);
};

window.onEliminar=i=>{
  if(!confirm("Eliminar producto?")) return;
  productos.splice(i,1);
  saveState();
  renderProductos(obtenerListaFiltrada());
  actualizarStats();
};

function obtenerListaFiltrada(){
  if(!filtro) return productos;
  const cat=filtro.value;
  if(cat==="todas") return productos;
  if(cat==="destacados") return productos.filter(p=>p.destacado);
  if(cat==="ofertas") return productos.filter(p=>p.oferta);
  return productos.filter(p=>p.categoria===cat);
}

/* ---------- PDF y BACKUP quedan igual ---------- */
