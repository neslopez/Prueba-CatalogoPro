/* script.js - versión limpia */

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

const inputNombreNegocio = $("nombreNegocio");
const inputLogoNegocio = $("logoNegocio");
const previewLogo = $("previewLogo");

/* ---------- UTIL ---------- */

function saveState(){
  localStorage.setItem("productos",JSON.stringify(productos));
  localStorage.setItem("categorias",JSON.stringify(categorias));
}

function mostrarAlerta(msg){
  alert(msg);
}

/* 🔥 VALIDACIÓN SIMPLE Y REAL */
function negocioConfigurado(){
  return inputNombreNegocio?.value.trim() !== "";
}

/* ---------- INIT ---------- */

document.addEventListener("DOMContentLoaded",()=>{

  poblarFiltros();
  renderProductos(productos);
  actualizarStats();

  /* cargar negocio */

  const nombreGuardado = localStorage.getItem("nombreNegocio");
  const logoGuardado = localStorage.getItem("logoNegocio");

  if(nombreGuardado) inputNombreNegocio.value = nombreGuardado;
  if(logoGuardado) previewLogo.src = logoGuardado;

  /* guardar negocio */

  inputNombreNegocio?.addEventListener("input",()=>{
    localStorage.setItem("nombreNegocio",inputNombreNegocio.value);
  });

  inputLogoNegocio?.addEventListener("change",(e)=>{
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = ev=>{
      localStorage.setItem("logoNegocio",ev.target.result);
      previewLogo.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* eventos */

  btnAgregar?.addEventListener("click",()=>{
    if(!negocioConfigurado()){
      return mostrarAlerta("Primero completá el nombre del negocio");
    }
    abrirModal();
  });

  btnGuardar?.addEventListener("click",guardarProducto);
  btnCancelar?.addEventListener("click",cerrarModal);

  imagen?.addEventListener("change",previewImagen);

  modal?.addEventListener("click",e=>{
    if(e.target===modal) cerrarModal();
  });

  filtro?.addEventListener("change",()=>renderProductos(obtenerLista()));
  ordenSelect?.addEventListener("change",()=>renderProductos(obtenerLista()));

  btnPDF?.addEventListener("click",generarPDF);

  btnLimpiar?.addEventListener("click",()=>{
    if(!confirm("¿Eliminar todo?")) return;
    productos=[];
    categorias=[];
    saveState();
    poblarFiltros();
    renderProductos(productos);
    actualizarStats();
  });

  btnBackup?.addEventListener("click",descargarBackup);

  /* 🔥 CATEGORÍAS CORREGIDO */

  btnAddCategoria?.addEventListener("click",()=>{
    const v = nuevaCategoriaInput.value.trim();
    if(!v) return mostrarAlerta("Escribe una categoría");

    if(!categorias.includes(v)){
      categorias.push(v);
      saveState();
    }

    poblarFiltros();
    nuevaCategoriaInput.value="";
    actualizarStats();
  });

});

/* ---------- CATEGORIAS ---------- */

function poblarFiltros(){

  filtro.innerHTML="";

  ["todas","destacados","ofertas"].forEach(v=>{
    const opt=document.createElement("option");
    opt.value=v;
    opt.textContent=v;
    filtro.appendChild(opt);
  });

  categorias.forEach(cat=>{
    const opt=document.createElement("option");
    opt.value=cat;
    opt.textContent=cat;
    filtro.appendChild(opt);
  });

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

  if(prod){
    nombre.value=prod.nombre;
    precio.value=prod.precio;
    categoriaSelect.value=prod.categoria;
    preview.src=prod.imagen;
    preview.style.display="block";
    destacado.checked=prod.destacado;
    oferta.checked=prod.oferta;
  }else{
    limpiarModal();
  }

  modal.classList.remove("oculto");
}

function cerrarModal(){
  modal.classList.add("oculto");
  limpiarModal();
}

function limpiarModal(){
  nombre.value="";
  precio.value="";
  imagen.value="";
  preview.src="";
  preview.style.display="none";
  destacado.checked=false;
  oferta.checked=false;
}

/* ---------- IMAGEN ---------- */

function previewImagen(e){
  const file=e.target.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onload=ev=>{
    preview.src=ev.target.result;
    preview.style.display="block";
  };
  reader.readAsDataURL(file);
}

/* ---------- CRUD ---------- */

function guardarProducto(){

  if(!nombre.value) return mostrarAlerta("Nombre requerido");
  if(!precio.value) return mostrarAlerta("Precio requerido");
  if(!preview.src) return mostrarAlerta("Imagen requerida");

  const nuevo={
    nombre:nombre.value,
    precio:Number(precio.value),
    categoria:categoriaSelect.value,
    imagen:preview.src,
    destacado:destacado.checked,
    oferta:oferta.checked
  };

  if(editIndex!==null){
    productos[editIndex]=nuevo;
  }else{
    productos.push(nuevo);
  }

  saveState();
  renderProductos(obtenerLista());
  actualizarStats();
  cerrarModal();
}

/* ---------- RENDER ---------- */

function renderProductos(list){

  contenedor.innerHTML="";

  list.forEach((p,i)=>{

    const div=document.createElement("div");
    div.className="producto";

    if(p.destacado) div.classList.add("destacado");
    if(p.oferta) div.classList.add("oferta");

    const badges =
    (p.destacado ? `<div class="badge destacado">⭐ Destacado</div>` : "") +
    (p.oferta ? `<div class="badge oferta">🔥 Oferta</div>` : "");

    div.innerHTML=`
    ${badges}
    <img src="${p.imagen}">
    <h3>${p.nombre}</h3>
    <p>${p.categoria||""}</p>
    <p><b>$${p.precio}</b></p>
    <div class="acciones">
      <button onclick="onEditar(${i})">✏️</button>
      <button onclick="onEliminar(${i})">🗑️</button>
    </div>
    `;

    contenedor.appendChild(div);
  });
}

window.onEditar=i=>{
  editIndex=i;
  abrirModal(productos[i]);
};

window.onEliminar=i=>{
  if(!confirm("Eliminar?")) return;
  productos.splice(i,1);
  saveState();
  renderProductos(obtenerLista());
  actualizarStats();
};

function obtenerLista(){
  const cat=filtro.value;
  if(cat==="todas") return productos;
  if(cat==="destacados") return productos.filter(p=>p.destacado);
  if(cat==="ofertas") return productos.filter(p=>p.oferta);
  return productos.filter(p=>p.categoria===cat);
}

/* ---------- STATS ---------- */

function actualizarStats(){
  statTotal.textContent=productos.length;
  statOfertas.textContent=productos.filter(p=>p.oferta).length;
  statDestacados.textContent=productos.filter(p=>p.destacado).length;
  statCategorias.textContent=categorias.length;
}

/* ---------- BACKUP ---------- */

function descargarBackup(){
  const blob=new Blob([JSON.stringify({productos,categorias})]);
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="backup.json";
  a.click();
}
