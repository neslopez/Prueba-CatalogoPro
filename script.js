/* script.js - CatálogoFácil PRO con datos de negocio */

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

/* GUARDAR NOMBRE */

inputNombreNegocio?.addEventListener("input",()=>{
localStorage.setItem("nombreNegocio",inputNombreNegocio.value);
});

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

btnAgregar?.addEventListener("click",()=>abrirModal(null));
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
renderProductos(productos);
actualizarStats();

});

btnBackup?.addEventListener("click",descargarBackup);

btnAddCategoria?.addEventListener("click",()=>{

const v = nuevaCategoriaInput.value.trim();

if(!v) return mostrarAlerta("Escribe el nombre de la categoría");

if(!categorias.includes(v)) categorias.push(v);

saveState();
poblarCategoriasEnModal();
nuevaCategoriaInput.value="";
actualizarStats();

});

});

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

list.forEach((p,i)=>{

const div = document.createElement("div");

div.className = "producto";

if(p.destacado) div.classList.add("destacado");
if(p.oferta) div.classList.add("oferta");

/* BADGES */

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

/* ---------- FILTRAR ---------- */

function obtenerListaFiltrada(){

if(!filtro) return productos;

const cat=filtro.value;

if(cat==="todas") return productos;
if(cat==="destacados") return productos.filter(p=>p.destacado);
if(cat==="ofertas") return productos.filter(p=>p.oferta);

return productos.filter(p=>p.categoria===cat);

}

/* ---------- PDF ---------- */

function generarPDF(){

const lista = obtenerListaFiltrada();

if(!lista.length){
return mostrarAlerta("No hay productos para generar el PDF.");
}

const nombreNegocio = localStorage.getItem("nombreNegocio") || "Catálogo";
const logoNegocio = localStorage.getItem("logoNegocio");

const categoriasPDF = [...new Set(lista.map(p => p.categoria || "Sin categoría"))];

const pdfDiv = document.createElement("div");
pdfDiv.style.fontFamily="Arial, sans-serif";
pdfDiv.style.padding="10px";

/* HEADER */

const header = document.createElement("div");
header.style.textAlign="center";
header.style.marginBottom="20px";

if(logoNegocio){

const logo = document.createElement("img");
logo.src = logoNegocio;
logo.style.width="90px";
logo.style.marginBottom="10px";

header.appendChild(logo);

}

const titulo = document.createElement("h1");
titulo.textContent = nombreNegocio;
titulo.style.margin="0";
titulo.style.fontSize="22px";

header.appendChild(titulo);

const fecha = document.createElement("div");
fecha.textContent = "Catálogo generado: " + new Date().toLocaleDateString();
fecha.style.fontSize="12px";
fecha.style.color="#666";

header.appendChild(fecha);

pdfDiv.appendChild(header);


/* CATEGORIAS */

categoriasPDF.forEach(cat=>{

const tituloCat = document.createElement("h2");

tituloCat.textContent = cat;
tituloCat.style.background="#0074D9";
tituloCat.style.color="white";
tituloCat.style.padding="6px";
tituloCat.style.borderRadius="6px";
tituloCat.style.marginTop="20px";

pdfDiv.appendChild(tituloCat);


const grid = document.createElement("div");

grid.style.display="flex";
grid.style.flexWrap="wrap";
grid.style.justifyContent="center";

lista
.filter(p => (p.categoria || "Sin categoría") === cat)
.forEach(p=>{

const card = document.createElement("div");

card.style.width="140px";
card.style.margin="8px";
card.style.border="1px solid #ddd";
card.style.borderRadius="8px";
card.style.padding="8px";
card.style.textAlign="center";
card.style.background="white";

if(p.destacado){
card.style.boxShadow="0 0 0 3px rgba(255,215,0,0.2)";
}

if(p.oferta){
card.style.border="2px solid #d9534f";
}


/* ETIQUETAS */

if(p.destacado || p.oferta){

const badge = document.createElement("div");

badge.style.fontSize="10px";
badge.style.fontWeight="bold";
badge.style.marginBottom="5px";

badge.textContent = p.destacado ? "⭐ DESTACADO" : "🔥 OFERTA";

if(p.destacado) badge.style.color="#b58300";
if(p.oferta) badge.style.color="#d9534f";

card.appendChild(badge);

}


/* IMAGEN */

const img = document.createElement("img");

img.src = p.imagen || "";
img.style.width="100%";
img.style.height="90px";
img.style.objectFit="cover";
img.style.borderRadius="6px";

card.appendChild(img);


/* NOMBRE */

const nombre = document.createElement("div");

nombre.textContent = p.nombre;
nombre.style.fontWeight="bold";
nombre.style.fontSize="12px";
nombre.style.marginTop="6px";

card.appendChild(nombre);


/* PRECIO */

const precio = document.createElement("div");

precio.textContent = "$" + p.precio;
precio.style.marginTop="4px";
precio.style.fontSize="12px";

if(p.oferta){
precio.style.color="#d9534f";
}

card.appendChild(precio);

grid.appendChild(card);

});

pdfDiv.appendChild(grid);

});


/* PIE */

const pie = document.createElement("div");

pie.style.marginTop="20px";
pie.style.textAlign="center";
pie.style.fontSize="11px";
pie.style.color="#666";

pie.textContent = "Productos: " + lista.length;

pdfDiv.appendChild(pie);


/* GENERAR PDF */

html2pdf()
.set({
margin:0.3,
filename:"catalogo.pdf",
html2canvas:{scale:2},
jsPDF:{unit:"in",format:"a4",orientation:"portrait"}
})
.from(pdfDiv)
.save();

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

const data={productos,categorias};

const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");
a.href=url;
a.download="catalogo_backup.json";

a.click();

URL.revokeObjectURL(url);

}
